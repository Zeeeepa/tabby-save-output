import { Injectable } from '@angular/core'
import { TerminalDecorator, BaseTerminalDecorator, Terminal } from 'tabby-terminal'
import { DatabaseService, TerminalRecord } from './database.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class SaveOutputDecorator extends BaseTerminalDecorator implements TerminalDecorator {
    private sessionId: string
    private buffer: string = ''
    private lastInput: string = ''
    private isProcessingCommand: boolean = false

    constructor(
        private databaseService: DatabaseService,
    ) {
        super()
        this.sessionId = uuidv4()
    }

    attach(terminal: Terminal): void {
        // Handle input (commands)
        terminal.input$.subscribe(data => {
            this.lastInput += data
            if (data.includes('\r') || data.includes('\n')) {
                const input = this.lastInput.trim()
                if (input) {
                    this.databaseService.saveRecord({
                        timestamp: new Date().toISOString(),
                        type: 'input',
                        content: input,
                        session_id: this.sessionId,
                        is_error: false
                    })
                }
                this.lastInput = ''
                this.isProcessingCommand = true
            }
        })

        // Handle output
        terminal.output$.subscribe(data => {
            if (this.isProcessingCommand) {
                this.buffer += data

                // Check if command output is complete (e.g., new prompt)
                if (data.includes('$') || data.includes('>') || data.includes('#')) {
                    const output = this.buffer.trim()
                    if (output) {
                        const isError = this.databaseService.analyzeResponse(output)
                        this.databaseService.saveRecord({
                            timestamp: new Date().toISOString(),
                            type: 'output',
                            content: output,
                            session_id: this.sessionId,
                            is_error: isError
                        })
                    }
                    this.buffer = ''
                    this.isProcessingCommand = false
                }
            }
        })
    }
}
