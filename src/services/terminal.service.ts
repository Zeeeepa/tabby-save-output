import { Injectable } from '@angular/core'
import { Terminal, TerminalDecorator } from 'tabby-terminal'
import { DatabaseService } from './database.service'
import { Subject } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'

@Injectable({ providedIn: 'root' })
export class TerminalService implements TerminalDecorator {
    private sessionId: string
    private outputBuffer = ''
    private inputBuffer = ''
    private readonly outputStream = new Subject<string>()

    constructor(private databaseService: DatabaseService) {
        this.sessionId = uuidv4()
    }

    attach(terminal: Terminal): void {
        // Handle terminal output
        terminal.output$.subscribe(data => {
            this.handleOutput(data.toString())
        })

        // Handle user input
        terminal.input$.subscribe(data => {
            this.handleInput(data.toString())
        })
    }

    private handleOutput(data: string) {
        // Append to buffer
        this.outputBuffer += data

        // Check for line endings
        if (this.outputBuffer.includes('\n') || this.outputBuffer.includes('\r')) {
            const lines = this.outputBuffer.split(/[\r\n]+/)
            
            // Keep the last incomplete line in buffer
            this.outputBuffer = lines.pop() || ''

            // Process complete lines
            for (const line of lines) {
                if (line.trim()) {
                    this.processOutput(line)
                }
            }
        }
    }

    private handleInput(data: string) {
        // Append to input buffer
        this.inputBuffer += data

        // Check for line endings
        if (this.inputBuffer.includes('\n') || this.inputBuffer.includes('\r')) {
            const lines = this.inputBuffer.split(/[\r\n]+/)
            
            // Keep the last incomplete line in buffer
            this.inputBuffer = lines.pop() || ''

            // Process complete lines
            for (const line of lines) {
                if (line.trim()) {
                    this.processInput(line)
                }
            }
        }
    }

    private async processOutput(content: string) {
        // Analyze the output for errors/issues
        const analysis = this.databaseService.analyzeOutput(content)

        // Save to database
        await this.databaseService.saveIO({
            sessionId: this.sessionId,
            type: 'output',
            content,
            timestamp: Date.now(),
            isError: analysis.isError,
            isIssue: analysis.isIssue
        })

        // Emit to stream
        this.outputStream.next(content)
    }

    private async processInput(content: string) {
        // Save to database
        await this.databaseService.saveIO({
            sessionId: this.sessionId,
            type: 'input',
            content,
            timestamp: Date.now(),
            isError: false,
            isIssue: false
        })
    }

    getSessionId(): string {
        return this.sessionId
    }

    getOutputStream() {
        return this.outputStream.asObservable()
    }
}
