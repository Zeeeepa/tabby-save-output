/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { ElectronService } from 'tabby-electron'
import * as path from 'path'
import * as sqlite3 from 'sqlite3'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
    styles: [require('./settingsTab.component.scss')],
})
export class SaveOutputSettingsTabComponent {
    private dbHelper: DatabaseHelper

    constructor(
        public config: ConfigService,
        private electron: ElectronService,
    ) {
        this.dbHelper = new DatabaseHelper(config, electron)
    }

    private showNotification(message: string, type: 'info' | 'error' = 'info'): void {
        this.electron.dialog.showMessageBox(null, {
            type: type === 'info' ? 'info' : 'error',
            message: message
        })
    }

    async pickDatabasePath(): Promise<void> {
        const dbConfig = this.config.store.saveOutput.database
        const { filePaths } = await this.electron.dialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath: dbConfig.path,
        })
        if (filePaths?.[0]) {
            dbConfig.path = filePaths[0]
            this.config.save()
        }
    }

    async onCreateNewDatabaseChange(): Promise<void> {
        await this.config.save()
        await this.dbHelper.createDatabase()
    }

    async testDatabaseConnection(): Promise<void> {
        await this.dbHelper.testConnection()
    }
}

// Database helper class to encapsulate SQLite operations
class DatabaseHelper {
    constructor(private config: ConfigService, private electron: ElectronService) {}

    private getDatabasePath(): string {
        const dbConfig = this.config.store.saveOutput.database
        return path.join(dbConfig.path, `${dbConfig.name}.db`)
    }

    private async withSQLiteDatabase<T>(operation: (db: sqlite3.Database) => Promise<T>): Promise<T> {
        const dbPath = this.getDatabasePath()
        const db = new sqlite3.Database(dbPath)
        try {
            return await operation(db)
        } catch (error) {
            throw error
        } finally {
            await new Promise<void>((resolve, reject) => {
                db.close((err) => err ? reject(err) : resolve())
            })
        }
    }

    private async runQuery(db: sqlite3.Database, sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(sql, (err) => err ? reject(err) : resolve())
        })
    }

    async testConnection(): Promise<void> {
        const dbConfig = this.config.store.saveOutput.database
        if (dbConfig.type === 'sqlite') {
            try {
                await this.withSQLiteDatabase(async (db) => {
                    await this.runQuery(db, `CREATE TABLE IF NOT EXISTS test_connection (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        test_column TEXT
                    )`)
                })
                this.showNotification('Database connection successful!')
            } catch (error) {
                this.showNotification(`Database connection failed: ${error.message}`, 'error')
            }
        }
    }

    async createDatabase(): Promise<void> {
        const dbConfig = this.config.store.saveOutput.database
        if (dbConfig.type === 'sqlite' && dbConfig.createNew) {
            try {
                await this.withSQLiteDatabase(async (db) => {
                    await this.runQuery(db, `CREATE TABLE IF NOT EXISTS sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT,
                        start_time DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`)
                    await this.runQuery(db, `CREATE TABLE IF NOT EXISTS commands (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT,
                        command TEXT,
                        output TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(session_id) REFERENCES sessions(session_id)
                    )`)
                })
                this.showNotification('Database created successfully!')
            } catch (error) {
                this.showNotification(`Failed to create database: ${error.message}`, 'error')
            }
        }
    }
}
