/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { ElectronHostWindow, ElectronService } from 'tabby-electron'
import * as sqlite3 from 'sqlite3'
import * as path from 'path'
import * as fs from 'fs'

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

    async createSQLiteDB(): Promise<void> {
        if (!this.config.store.saveOutput.dbConfig.name) {
            await this.electron.dialog.showMessageBox(
                this.hostWindow.getWindow(),
                {
                    type: 'error',
                    message: 'Please enter a database name',
                }
            )
            return
        }

        const dbPath = path.join(process.env.HOME || process.env.USERPROFILE || '.', 
            `${this.config.store.saveOutput.dbConfig.name}.db`)

        try {
            // Create SQLite database
            const db = new sqlite3.Database(dbPath)
            
            // Create necessary tables
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS command_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    command TEXT,
                    response TEXT,
                    session_id TEXT
                )`)
            })

            db.close()

            // Save the database path and credentials
            this.config.store.saveOutput.dbConfig.host = dbPath
            this.config.save()

            await this.electron.dialog.showMessageBox(
                this.hostWindow.getWindow(),
                {
                    type: 'info',
                    message: 'SQLite database created successfully!',
                }
            )
        } catch (error) {
            await this.electron.dialog.showMessageBox(
                this.hostWindow.getWindow(),
                {
                    type: 'error',
                    message: `Failed to create database: ${error.message}`,
                }
            )
        }
    }

    async testConnection(): Promise<void> {
        try {
            const db = new sqlite3.Database(this.config.store.saveOutput.dbConfig.host)
            db.close()
            
            await this.electron.dialog.showMessageBox(
                this.hostWindow.getWindow(),
                {
                    type: 'info',
                    message: 'Database connection successful!',
                }
            )
        } catch (error) {
            await this.electron.dialog.showMessageBox(
                this.hostWindow.getWindow(),
                {
                    type: 'error',
                    message: `Connection failed: ${error.message}`,
                }
            )
        }
    }
}
