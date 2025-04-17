import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import * as knex from 'knex'
import * as BetterSqlite3 from 'better-sqlite3'

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    private db: knex.Knex | null = null
    private dbConfig: any = null

    constructor(
        private config: ConfigService,
    ) {
        this.initializeDatabase()
    }

    private async initializeDatabase() {
        const settings = this.config.store.saveOutput
        if (!settings?.useDatabase) {
            return
        }

        if (settings.createNewDb) {
            // Create new SQLite database
            this.dbConfig = {
                client: 'better-sqlite3',
                connection: {
                    filename: settings.dbPath || './terminal_output.db'
                },
                useNullAsDefault: true
            }
        } else {
            // Use existing database with credentials
            this.dbConfig = {
                client: settings.dbType || 'better-sqlite3',
                connection: {
                    host: settings.dbHost,
                    user: settings.dbUser,
                    password: settings.dbPassword,
                    database: settings.dbName
                }
            }
        }

        try {
            this.db = knex(this.dbConfig)
            await this.createTables()
        } catch (error) {
            console.error('Failed to initialize database:', error)
        }
    }

    private async createTables() {
        if (!this.db) return

        // Create sessions table
        await this.db.schema.createTableIfNotExists('sessions', table => {
            table.increments('id')
            table.string('tab_id')
            table.timestamp('start_time').defaultTo(this.db?.fn.now())
            table.timestamp('end_time')
            table.string('status')
        })

        // Create terminal_output table
        await this.db.schema.createTableIfNotExists('terminal_output', table => {
            table.increments('id')
            table.integer('session_id').references('id').inTable('sessions')
            table.text('input')
            table.text('output')
            table.timestamp('timestamp').defaultTo(this.db?.fn.now())
            table.string('type') // 'input' or 'response'
        })
    }

    async saveOutput(sessionId: number, input: string, output: string, type: string) {
        if (!this.db) return

        try {
            await this.db('terminal_output').insert({
                session_id: sessionId,
                input,
                output,
                type,
                timestamp: new Date()
            })
        } catch (error) {
            console.error('Failed to save output:', error)
        }
    }

    async createSession(tabId: string): Promise<number> {
        if (!this.db) return -1

        try {
            const [id] = await this.db('sessions').insert({
                tab_id: tabId,
                status: 'active',
                start_time: new Date()
            })
            return id
        } catch (error) {
            console.error('Failed to create session:', error)
            return -1
        }
    }

    async endSession(sessionId: number) {
        if (!this.db) return

        try {
            await this.db('sessions')
                .where('id', sessionId)
                .update({
                    status: 'completed',
                    end_time: new Date()
                })
        } catch (error) {
            console.error('Failed to end session:', error)
        }
    }
}
