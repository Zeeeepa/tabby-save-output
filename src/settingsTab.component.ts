/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { ElectronHostWindow, ElectronService } from 'tabby-electron'
import * as sqlite3 from 'sqlite3'
import * as path from 'path'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
})
export class SaveOutputSettingsTabComponent {
    constructor (
        public config: ConfigService,
        private electron: ElectronService,
        private hostWindow: ElectronHostWindow,
    ) { }

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

    async pickDatabasePath (): Promise<void> {
        const paths = (await this.electron.dialog.showOpenDialog(
            this.hostWindow.getWindow(),
            {
                properties: ['openDirectory', 'showHiddenFiles'],
            }
        )).filePaths
        if (paths[0]) {
            this.config.store.saveOutput.database.path = paths[0]
            this.config.save()
        }
    }

    async testDatabaseConnection (): Promise<void> {
        const dbConfig = this.config.store.saveOutput.database
        if (dbConfig.type === 'sqlite') {
            try {
                const dbPath = path.join(dbConfig.path, `${dbConfig.name}.db`)
                const db = new sqlite3.Database(dbPath)
                
                // Test connection by creating a test table
                db.run(`CREATE TABLE IF NOT EXISTS test_connection (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    test_column TEXT
                )`)
                
                db.close()
                alert('Database connection successful!')
            } catch (error) {
                alert(`Database connection failed: ${error.message}`)
            }
        }
    }

    async createNewDatabase (): Promise<void> {
        const dbConfig = this.config.store.saveOutput.database
        if (dbConfig.type === 'sqlite' && dbConfig.createNew) {
            try {
                const dbPath = path.join(dbConfig.path, `${dbConfig.name}.db`)
                const db = new sqlite3.Database(dbPath)
                
                // Create necessary tables
                db.serialize(() => {
                    db.run(`CREATE TABLE IF NOT EXISTS sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT,
                        start_time DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`)

                    db.run(`CREATE TABLE IF NOT EXISTS commands (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT,
                        command TEXT,
                        output TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(session_id) REFERENCES sessions(session_id)
                    )`)
                })
                
                db.close()
                alert('Database created successfully!')
            } catch (error) {
                alert(`Failed to create database: ${error.message}`)
            }
        }
    }
}
