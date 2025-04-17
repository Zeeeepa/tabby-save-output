import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import * as knex from 'knex'

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    private db: any

    constructor(
        private config: ConfigService,
    ) {
        this.initializeDatabase()
    }

    private async initializeDatabase() {
        const { databaseName, databaseHost, databasePort, databaseUsername, databasePassword } = this.config.store.saveOutput

        if (!databaseName) {
            return
        }

        this.db = knex({
            client: 'pg',
            connection: {
                host: databaseHost,
                port: databasePort,
                user: databaseUsername,
                password: databasePassword,
                database: databaseName
            }
        })

        // Create tables if they don't exist
        await this.db.schema.createTableIfNotExists('terminal_sessions', table => {
            table.increments('id').primary()
            table.string('session_id').notNullable()
            table.timestamp('created_at').defaultTo(this.db.fn.now())
            table.timestamp('updated_at').defaultTo(this.db.fn.now())
        })

        await this.db.schema.createTableIfNotExists('terminal_output', table => {
            table.increments('id').primary()
            table.integer('session_id').references('id').inTable('terminal_sessions')
            table.text('input').nullable()
            table.text('output').notNullable()
            table.timestamp('timestamp').defaultTo(this.db.fn.now())
        })
    }

    async saveTerminalOutput(sessionId: string, input: string | null, output: string): Promise<void> {
        if (!this.db) {
            return
        }

        let session = await this.db('terminal_sessions')
            .where('session_id', sessionId)
            .first()

        if (!session) {
            [session] = await this.db('terminal_sessions')
                .insert({ session_id: sessionId })
                .returning('*')
        }

        await this.db('terminal_output').insert({
            session_id: session.id,
            input,
            output,
            timestamp: new Date()
        })
    }
}
