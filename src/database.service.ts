import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import * as BetterSqlite3 from 'better-sqlite3'
import * as path from 'path'
import * as moment from 'moment'

export interface TerminalRecord {
    id?: number
    sessionId: string
    timestamp: string
    input: string
    output: string
    isError: boolean
    errorType?: string
}

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    private db: BetterSqlite3.Database

    constructor(
        private config: ConfigService,
    ) {
        const dbPath = path.join(config.configPath, 'terminal_history.db')
        this.db = new BetterSqlite3(dbPath)
        this.initDatabase()
    }

    private initDatabase() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS terminal_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sessionId TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                input TEXT,
                output TEXT,
                isError BOOLEAN,
                errorType TEXT
            )
        `)
    }

    saveRecord(record: TerminalRecord): number {
        const stmt = this.db.prepare(`
            INSERT INTO terminal_records (sessionId, timestamp, input, output, isError, errorType)
            VALUES (@sessionId, @timestamp, @input, @output, @isError, @errorType)
        `)
        
        const result = stmt.run({
            sessionId: record.sessionId,
            timestamp: record.timestamp || moment().format(),
            input: record.input,
            output: record.output,
            isError: record.isError ? 1 : 0,
            errorType: record.errorType
        })

        return result.lastInsertRowid as number
    }

    getRecordsBySession(sessionId: string): TerminalRecord[] {
        const stmt = this.db.prepare('SELECT * FROM terminal_records WHERE sessionId = ? ORDER BY timestamp DESC')
        return stmt.all(sessionId) as TerminalRecord[]
    }

    getRecentRecords(limit = 100): TerminalRecord[] {
        const stmt = this.db.prepare('SELECT * FROM terminal_records ORDER BY timestamp DESC LIMIT ?')
        return stmt.all(limit) as TerminalRecord[]
    }

    getErrorRecords(): TerminalRecord[] {
        const stmt = this.db.prepare('SELECT * FROM terminal_records WHERE isError = 1 ORDER BY timestamp DESC')
        return stmt.all() as TerminalRecord[]
    }

    analyzeOutput(output: string): { isError: boolean, errorType?: string } {
        // Common error patterns
        const errorPatterns = [
            { pattern: /error:/i, type: 'General Error' },
            { pattern: /exception:/i, type: 'Exception' },
            { pattern: /fatal:/i, type: 'Fatal Error' },
            { pattern: /failed:/i, type: 'Failure' },
            { pattern: /command not found/i, type: 'Command Not Found' },
            { pattern: /permission denied/i, type: 'Permission Error' },
            { pattern: /no such file or directory/i, type: 'File Not Found' },
            { pattern: /npm ERR!/i, type: 'NPM Error' },
            { pattern: /syntax error/i, type: 'Syntax Error' }
        ]

        // Check for extensive error output (multiple lines with error-like content)
        const lines = output.split('\n')
        const errorLineCount = lines.filter(line => 
            errorPatterns.some(pattern => pattern.pattern.test(line))
        ).length

        // If there are multiple error lines or specific error patterns, mark as error
        if (errorLineCount > 2) {
            return { isError: true, errorType: 'Multiple Errors' }
        }

        // Check for specific error patterns
        for (const { pattern, type } of errorPatterns) {
            if (pattern.test(output)) {
                return { isError: true, errorType: type }
            }
        }

        return { isError: false }
    }
}
