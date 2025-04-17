import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import * as sqlite3 from 'better-sqlite3'

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    private db: any = null

    constructor(private config: ConfigService) {
        this.initDatabase()
    }

    private initDatabase() {
        if (!this.config.store.saveOutput?.enabled) {
            return
        }

        const dbPath = this.config.store.saveOutput.databasePath
        this.db = new sqlite3(dbPath)
        
        // Create tables if they don't exist
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS terminal_output (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                timestamp TEXT,
                input TEXT,
                output TEXT
            )
        `)
    }

    saveOutput(sessionId: string, input: string, output: string) {
        if (!this.db) {
            return
        }

        const stmt = this.db.prepare(`
            INSERT INTO terminal_output (session_id, timestamp, input, output)
            VALUES (?, ?, ?, ?)
        `)

        stmt.run(sessionId, new Date().toISOString(), input, output)
    }
}
