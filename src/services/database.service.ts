import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import * as BetterSqlite3 from 'better-sqlite3'
import * as path from 'path'

export interface TerminalIO {
    id: string
    sessionId: string
    type: 'input' | 'output'
    content: string
    timestamp: number
    isError: boolean
    isIssue: boolean
}

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    private db: BetterSqlite3.Database
    private readonly dbPath: string

    constructor(
        private config: ConfigService,
    ) {
        this.dbPath = path.join(config.configPath, 'terminal-history.db')
        this.initDatabase()
    }

    private initDatabase() {
        this.db = new BetterSqlite3(this.dbPath)
        
        // Create tables if they don't exist
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS terminal_io (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                is_error BOOLEAN NOT NULL,
                is_issue BOOLEAN NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_session_timestamp 
            ON terminal_io(session_id, timestamp);
        `)
    }

    async saveIO(data: Omit<TerminalIO, 'id'>): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO terminal_io (id, session_id, type, content, timestamp, is_error, is_issue)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        
        const id = Math.random().toString(36).substring(2)
        stmt.run(id, data.sessionId, data.type, data.content, data.timestamp, data.isError, data.isIssue)
    }

    getSessionHistory(sessionId: string): TerminalIO[] {
        const stmt = this.db.prepare('SELECT * FROM terminal_io WHERE session_id = ? ORDER BY timestamp ASC')
        return stmt.all(sessionId) as TerminalIO[]
    }

    analyzeOutput(content: string): { isError: boolean; isIssue: boolean } {
        // Simple error patterns (like cd errors, command not found)
        const simpleErrorPatterns = [
            /command not found/i,
            /no such file or directory/i,
            /permission denied/i,
            /is not recognized/i
        ]

        // Complex issue patterns (like npm errors, compilation failures)
        const issuePatterns = [
            /error\s+[A-Z]+\d+/i,  // Error codes
            /\d+\s+error(s)?/i,    // Error counts
            /stack trace/i,         // Stack traces
            /exception in thread/i, // Thread exceptions
            /failed to compile/i,   // Compilation failures
            /npm ERR!/i,           // NPM errors
            /fatal error/i          // Fatal errors
        ]

        const isSimpleError = simpleErrorPatterns.some(pattern => pattern.test(content))
        const isComplexIssue = issuePatterns.some(pattern => pattern.test(content))

        return {
            isError: isSimpleError,
            isIssue: isComplexIssue
        }
    }
}
