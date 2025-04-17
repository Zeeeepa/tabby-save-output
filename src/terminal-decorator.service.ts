import { Injectable } from '@angular/core'
import { TerminalDecorator as BaseTerminalDecorator } from 'tabby-terminal'
import { DatabaseService } from './database.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class TerminalDecorator extends BaseTerminalDecorator {
    private currentSessionId: string
    private currentInput: string = ''
    private outputBuffer: string = ''
    private lastCommandTime: number = 0

    constructor(
        private database: DatabaseService
    ) {
        super()
        this.currentSessionId = uuidv4()
    }

    feedProcessData(data: string): void {
        // Append to output buffer
        this.outputBuffer += data

        // If we haven't seen input for a while, this might be command output
        const now = Date.now()
        if (now - this.lastCommandTime > 100) {
            // Analyze and store the output
            const analysis = this.database.analyzeOutput(this.outputBuffer)
            
            this.database.saveRecord({
                sessionId: this.currentSessionId,
                timestamp: new Date().toISOString(),
                input: this.currentInput,
                output: this.outputBuffer,
                isError: analysis.isError,
                errorType: analysis.errorType
            })

            // Reset buffers
            this.currentInput = ''
            this.outputBuffer = ''
        }
    }

    feedProcessInput(data: string): void {
        // Track input
        this.currentInput += data
        this.lastCommandTime = Date.now()
    }
}
