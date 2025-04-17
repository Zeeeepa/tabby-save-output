/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { ElectronHostWindow, ElectronService } from 'tabby-electron'
import * as path from 'path'
import * as sqlite3 from 'sqlite3'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
    styles: [require('./settingsTab.component.scss')],
})
export class SaveOutputSettingsTabComponent {
    constructor (
        public config: ConfigService,
        private electron: ElectronService,
        private hostWindow: ElectronHostWindow,
    ) { }

    private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
        // Replace alert() with Electron's native dialog
        this.electron.dialog.showMessageBox(this.hostWindow.getWindow(), {
            type: type === 'success' ? 'info' : 'error',
            message
        })
    }

    async pickDirectory (): Promise<void> {
        const paths = (await this.electron.dialog.showOpenDialog(
            this.hostWindow.getWindow(),
            {
                properties: ['openDirectory', 'showHiddenFiles'],
            }
        )).filePaths
        if (paths[0]) {
            this.config.store.saveOutput.autoSaveDirectory = paths[0]
            this.config.save()
        }
    }

    async testDatabaseConnection(): Promise<void> {
        const dbConfig = this.config.store.saveOutput.database
        if (dbConfig.type === 'sqlite') {
            try {
                const helper = new DatabaseHelper(dbConfig)
                await helper.testConnection()
                this.showNotification('Database connection successful!')
            } catch (error) {
                this.showNotification(`Database connection failed: ${error.message}`, 'error')
            }
        }
    }

    async onCreateNewDatabaseChange(): Promise<void> {
        await this.config.save()
        await this.createNewDatabase()
    }

    async createNewDatabase(): Promise<void> {
        const dbConfig = this.config.store.saveOutput.database
        if (dbConfig.type === 'sqlite' && dbConfig.createNew) {
            try {
                const helper = new DatabaseHelper(dbConfig)
                await helper.createTables()
                this.showNotification('Database created successfully!')
            } catch (error) {
                this.showNotification(`Failed to create database: ${error.message}`, 'error')
            }
        }
    }
}

// Database helper class for cleaner SQLite operations
class DatabaseHelper {
    private dbPath: string
    
    constructor(dbConfig: any) {
        this.dbPath = path.join(dbConfig.path, `${dbConfig.name}.db`)
    }

    private async withDatabase<T>(operation: (db: sqlite3.Database) => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath, async (err) => {
                if (err) {
                    reject(err)
                    return
                }
                try {
                    const result = await operation(db)
                    db.close((closeErr) => {
                        if (closeErr) {
                            reject(closeErr)
                        } else {
                            resolve(result)
                        }
                    })
                } catch (error) {
                    db.close()
                    reject(error)
                }
            })
        })
    }

    private async runQuery(db: sqlite3.Database, sql: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            db.run(sql, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    async testConnection(): Promise<void> {
        await this.withDatabase(async (db) => {
            await this.runQuery(db, `
                CREATE TABLE IF NOT EXISTS test_connection (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    test_column TEXT
                )
            `)
        })
    }

    async createTables(): Promise<void> {
        await this.withDatabase(async (db) => {
            await this.runQuery(db, `
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    start_time DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `)
            
            await this.runQuery(db, `
                CREATE TABLE IF NOT EXISTS commands (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    command TEXT,
                    output TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
                )
            `)
        })
    }
}
