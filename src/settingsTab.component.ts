/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'
import * as path from 'path'
import * as sqlite3 from 'sqlite3'
import { dialog } from '@electron/remote'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
    styles: [require('./settingsTab.component.scss')],
})
export class SaveOutputSettingsTabComponent {
    constructor(
        public config: ConfigService,
    ) { }

    // Utility method to get the database path
    private getDatabasePath(): string {
        const dbConfig = this.config.store.saveOutput.database
        return path.join(dbConfig.path, `${dbConfig.name}.db`)
    }

    // Utility to handle SQLite operations cleanly
    private async withSQLiteDatabase<T>(operation: (db: sqlite3.Database) => Promise<T>): Promise<T> {
        const dbPath = this.getDatabasePath()
        const db = new sqlite3.Database(dbPath)
        try {
            return await operation(db)
        } catch (error) {
            throw error
        } finally {
            await new Promise<void>((resolve, reject) => {
                db.close((err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
    }

    // Helper function to run a query and return a promise
    private async runQuery(db: sqlite3.Database, sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(sql, (err: Error | null) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    async pickDatabasePath(): Promise<void> {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory'],
        })
        if (result.filePaths.length) {
            this.config.store.saveOutput.database.path = result.filePaths[0]
            this.config.save()
        }
    }

    async onCreateNewDatabaseChange(): Promise<void> {
        await this.config.save()
        await this.createNewDatabase()
    }

    async testDatabaseConnection(): Promise<void> {
        const dbConfig = this.config.store.saveOutput.database
        if (dbConfig.type === 'sqlite') {
            try {
                await this.withSQLiteDatabase(async (db) => {
                    await this.runQuery(db, `CREATE TABLE IF NOT EXISTS test_connection (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        test_column TEXT
                    )`)
                })
                await dialog.showMessageBox({
                    type: 'info',
                    message: 'Database connection successful!'
                })
            } catch (error) {
                await dialog.showMessageBox({
                    type: 'error',
                    message: `Database connection failed: ${error.message}`
                })
            }
        }
    }

    async createNewDatabase(): Promise<void> {
        const dbConfig = this.config.store.saveOutput.database
        if (dbConfig.type === 'sqlite' && dbConfig.createNew) {
            try {
                await this.withSQLiteDatabase(async (db) => {
                    // Create sessions table
                    await this.runQuery(db, `CREATE TABLE IF NOT EXISTS sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT,
                        start_time DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`)

                    // Create commands table
                    await this.runQuery(db, `CREATE TABLE IF NOT EXISTS commands (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT,
                        command TEXT,
                        output TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(session_id) REFERENCES sessions(session_id)
                    )`)
                })
                await dialog.showMessageBox({
                    type: 'info',
                    message: 'Database created successfully!'
                })
            } catch (error) {
                await dialog.showMessageBox({
                    type: 'error',
                    message: `Failed to create database: ${error.message}`
                })
            }
        }
    }
}
