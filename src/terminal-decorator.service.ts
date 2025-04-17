import { Injectable } from '@angular/core'
import { TerminalDecorator, Terminal } from 'tabby-terminal'
import { DatabaseService } from './services/database.service'
import { ConfigService } from 'tabby-core'

@Injectable()
export class TerminalDecorator extends TerminalDecorator {
    private lastInput: string = ''
    private buffer: string = ''

    constructor(
        private config: ConfigService,
        private database: DatabaseService,
    ) {
        super()
    }

    attach(terminal: Terminal): void {
        if (!this.config.store.saveOutput?.enabled) {
            return
        }

        const sessionId = Math.random().toString(36).substring(7)

        terminal.input$.subscribe(data => {
            this.lastInput = data
        })

        terminal.output$.subscribe(data => {
            this.buffer += data

            // Save when we see a prompt or after a delay
            if (data.includes('\n') || data.includes('\r')) {
                this.database.saveOutput(sessionId, this.lastInput, this.buffer)
                this.buffer = ''
            }
        })
    }
}
