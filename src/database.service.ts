import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import * as path from 'path'
import Database from 'better-sqlite3'

export interface TerminalRecord {
    id?: number
    sessionId: string
    timestamp: string
    type: 'input' | 'output'
    content: string
    title: string
}

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    private db: Database.Database

    constructor(
        private config: ConfigService,
    ) {
        const dbPath = path.join(this.config.store.saveOutput.autoSaveDirectory || process.env.HOME || process.env.USERPROFILE, 'terminal_history.db')
        this.db = new Database(dbPath)
        this.initDatabase()
    }

    private initDatabase() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS terminal_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sessionId TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                title TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_session_timestamp ON terminal_records(sessionId, timestamp);
        `)
    }

    saveRecord(record: TerminalRecord): void {
        const stmt = this.db.prepare('INSERT INTO terminal_records (sessionId, timestamp, type, content, title) VALUES (?, ?, ?, ?, ?)')
        stmt.run(record.sessionId, record.timestamp, record.type, record.content, record.title)
    }

    getSessionRecords(sessionId: string): TerminalRecord[] {
        const stmt = this.db.prepare('SELECT * FROM terminal_records WHERE sessionId = ? ORDER BY timestamp ASC')
        return stmt.all(sessionId)
    }

    searchRecords(query: string): TerminalRecord[] {
        const stmt = this.db.prepare('SELECT * FROM terminal_records WHERE content LIKE ? ORDER BY timestamp DESC LIMIT 100')
        return stmt.all(`%${query}%`)
    }

    getRecentSessions(limit: number = 10): { sessionId: string, title: string, lastTimestamp: string }[] {
        return this.db.prepare(`
            SELECT sessionId, title, MAX(timestamp) as lastTimestamp
            FROM terminal_records
            GROUP BY sessionId, title
            ORDER BY lastTimestamp DESC
            LIMIT ?
        `).all(limit)
    }
}
