import { Injectable } from '@angular/core'
import Database from 'better-sqlite3'
import * as path from 'path'
import { ConfigService } from 'tabby-core'

export interface TerminalRecord {
    id?: number
    timestamp: string
    type: 'input' | 'output'
    content: string
    session_id: string
    is_error: boolean
}

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    private db: Database.Database
    
    constructor(
        private config: ConfigService,
    ) {
        const dbPath = path.join(config.configPath, 'terminal_history.db')
        this.db = new Database(dbPath)
        this.initDatabase()
    }

    private initDatabase() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS terminal_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                session_id TEXT NOT NULL,
                is_error BOOLEAN NOT NULL DEFAULT 0
            )
        `)
    }

    saveRecord(record: TerminalRecord): number {
        const stmt = this.db.prepare(`
            INSERT INTO terminal_records (timestamp, type, content, session_id, is_error)
            VALUES (@timestamp, @type, @content, @session_id, @is_error)
        `)
        const result = stmt.run(record)
        return result.lastInsertRowid as number
    }

    getSessionRecords(sessionId: string): TerminalRecord[] {
        const stmt = this.db.prepare('SELECT * FROM terminal_records WHERE session_id = ? ORDER BY timestamp ASC')
        return stmt.all(sessionId) as TerminalRecord[]
    }

    getRecentSessions(limit: number = 10): string[] {
        const stmt = this.db.prepare(`
            SELECT DISTINCT session_id 
            FROM terminal_records 
            GROUP BY session_id 
            ORDER BY MAX(timestamp) DESC 
            LIMIT ?
        `)
        return stmt.all(limit).map(row => row.session_id)
    }

    analyzeResponse(content: string): boolean {
        // Simple error detection - can be enhanced with more sophisticated patterns
        const errorPatterns = [
            /error/i,
            /exception/i,
            /failed/i,
            /fatal/i,
            /invalid/i,
            /not found/i,
        ]
        
        return errorPatterns.some(pattern => pattern.test(content))
    }
}
