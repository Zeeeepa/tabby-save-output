import * as path from 'path'
import * as sqlite3 from 'sqlite3'
import { v4 as uuidv4 } from 'uuid'
import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    private db: sqlite3.Database | null = null
    private sessionId: string | null = null

    constructor(private config: ConfigService) {}

    /**
     * Initialize the database connection
     */
    async initialize(): Promise<boolean> {
        if (this.db) {
            return true
        }

        const dbConfig = this.config.store.saveOutput.database
        if (!dbConfig || !dbConfig.path || !dbConfig.name) {
            return false
        }

        const dbPath = path.join(dbConfig.path, `${dbConfig.name}.db`)
        
        return new Promise<boolean>((resolve) => {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error connecting to database:', err.message)
                    resolve(false)
                    return
                }
                
                this.ensureTablesExist().then(() => {
                    this.createNewSession().then(() => {
                        resolve(true)
                    }).catch(() => resolve(false))
                }).catch(() => resolve(false))
            })
        })
    }

    /**
     * Ensure required tables exist in the database
     */
    private async ensureTablesExist(): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized')
        }

        return new Promise<void>((resolve, reject) => {
            this.db!.serialize(() => {
                // Create sessions table
                this.db!.run(`
                    CREATE TABLE IF NOT EXISTS sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT UNIQUE,
                        tab_title TEXT,
                        start_time DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) {
                        reject(err)
                        return
                    }
                })

                // Create output table
                this.db!.run(`
                    CREATE TABLE IF NOT EXISTS terminal_output (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT,
                        output TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(session_id) REFERENCES sessions(session_id)
                    )
                `, (err) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve()
                })
            })
        })
    }

    /**
     * Create a new session in the database
     */
    private async createNewSession(tabTitle: string = 'Untitled'): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized')
        }

        this.sessionId = uuidv4()

        return new Promise<void>((resolve, reject) => {
            this.db!.run(
                'INSERT INTO sessions (session_id, tab_title) VALUES (?, ?)',
                [this.sessionId, tabTitle],
                (err) => {
                    if (err) {
                        console.error('Error creating session:', err.message)
                        reject(err)
                        return
                    }
                    resolve()
                }
            )
        })
    }

    /**
     * Save terminal output to the database
     */
    async saveOutput(output: string): Promise<void> {
        if (!this.db || !this.sessionId) {
            throw new Error('Database or session not initialized')
        }

        return new Promise<void>((resolve, reject) => {
            this.db!.run(
                'INSERT INTO terminal_output (session_id, output) VALUES (?, ?)',
                [this.sessionId, output],
                (err) => {
                    if (err) {
                        console.error('Error saving output:', err.message)
                        reject(err)
                        return
                    }
                    resolve()
                }
            )
        })
    }

    /**
     * Close the database connection
     */
    async close(): Promise<void> {
        if (!this.db) {
            return
        }

        return new Promise<void>((resolve, reject) => {
            this.db!.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message)
                    reject(err)
                    return
                }
                this.db = null
                this.sessionId = null
                resolve()
            })
        })
    }

    /**
     * Update the session title
     */
    async updateSessionTitle(title: string): Promise<void> {
        if (!this.db || !this.sessionId) {
            return
        }

        return new Promise<void>((resolve, reject) => {
            this.db!.run(
                'UPDATE sessions SET tab_title = ? WHERE session_id = ?',
                [title, this.sessionId],
                (err) => {
                    if (err) {
                        console.error('Error updating session title:', err.message)
                        reject(err)
                        return
                    }
                    resolve()
                }
            )
        })
    }
}
