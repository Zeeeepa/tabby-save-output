import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import Database from 'better-sqlite3'

export interface DatabaseConfig {
    type: 'sqlite' | 'custom'
    path?: string
    host?: string
    port?: number
    username?: string
    password?: string
    database?: string
    createIfNotExists?: boolean
}

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    private db: Database | null = null
    private config: DatabaseConfig

    constructor(
        private configService: ConfigService,
    ) {
        this.config = this.configService.store.saveOutput?.database || {}
        this.initializeDatabase()
    }

    private initializeDatabase() {
        if (this.config.type === 'sqlite') {
            try {
                const dbPath = this.config.path || 'tabby-output.db'
                this.db = new Database(dbPath)
                
                // Create tables if they don't exist
                this.db.exec(`
                    CREATE TABLE IF NOT EXISTS terminal_output (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT NOT NULL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        type TEXT NOT NULL,
                        content TEXT NOT NULL
                    );
                    
                    CREATE TABLE IF NOT EXISTS sessions (
                        id TEXT PRIMARY KEY,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        tab_name TEXT,
                        status TEXT
                    );
                `)
            } catch (error) {
                console.error('Failed to initialize SQLite database:', error)
            }
        }
    }

    async saveOutput(sessionId: string, type: 'input' | 'response', content: string): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized')
        }

        const stmt = this.db.prepare('INSERT INTO terminal_output (session_id, type, content) VALUES (?, ?, ?)')
        stmt.run(sessionId, type, content)
    }

    async createSession(sessionId: string, tabName: string): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized')
        }

        const stmt = this.db.prepare('INSERT INTO sessions (id, tab_name, status) VALUES (?, ?, ?)')
        stmt.run(sessionId, tabName, 'active')
    }

    async closeSession(sessionId: string): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized')
        }

        const stmt = this.db.prepare('UPDATE sessions SET status = ? WHERE id = ?')
        stmt.run('closed', sessionId)
    }

    getSessionOutputs(sessionId: string): any[] {
        if (!this.db) {
            throw new Error('Database not initialized')
        }

        const stmt = this.db.prepare('SELECT * FROM terminal_output WHERE session_id = ? ORDER BY timestamp ASC')
        return stmt.all(sessionId)
    }

    getAllSessions(): any[] {
        if (!this.db) {
            throw new Error('Database not initialized')
        }

        const stmt = this.db.prepare('SELECT * FROM sessions ORDER BY created_at DESC')
        return stmt.all()
    }
}
