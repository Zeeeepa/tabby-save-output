import { Injectable } from '@angular/core'
import { TerminalDecorator, Terminal, BaseTerminalTabComponent } from 'tabby-terminal'
import { DatabaseService } from './services/database.service'
import { ConfigService } from 'tabby-core'
import { v4 as uuidv4 } from 'uuid'

/** @hidden */
@Injectable()
export class SaveOutputDecorator extends TerminalDecorator {
    private sessionId: string | null = null
    private currentInput: string = ''
    private outputBuffer: string = ''

    constructor(
        private config: ConfigService,
        private databaseService: DatabaseService,
    ) {
        super()
    }

    attach(terminal: Terminal): void {
        const tab = terminal.tab as BaseTerminalTabComponent
        
        if (!this.config.store.saveOutput?.autoSave) {
            return
        }

        this.sessionId = uuidv4()
        this.databaseService.createSession(this.sessionId, tab.title)

        // Capture input
        terminal.input$.subscribe(data => {
            this.currentInput += data
            if (data === '\r' || data === '\n') {
                if (this.currentInput.trim()) {
                    this.databaseService.saveOutput(this.sessionId, this.currentInput.trim(), '')
                }
                this.currentInput = ''
            }
        })

        // Capture output
        terminal.output$.subscribe(data => {
            this.outputBuffer += data
            if (data.includes('\n') || data.includes('\r')) {
                if (this.outputBuffer.trim()) {
                    this.databaseService.saveOutput(this.sessionId, null, this.outputBuffer.trim())
                }
                this.outputBuffer = ''
            }
        })
    }
}
