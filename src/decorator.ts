import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { TerminalDecorator, BaseTerminalTabComponent, BaseSession } from 'tabby-terminal'
import { SSHTabComponent } from 'tabby-ssh'
import { cleanupOutput } from './util'
import { DatabaseService } from './database.service'

@Injectable()
export class SaveOutputDecorator extends TerminalDecorator {
    constructor (
        private config: ConfigService,
        private database: DatabaseService,
    ) {
        super()
    }

    attach (tab: BaseTerminalTabComponent): void {
        if (this.config.store.saveOutput.autoSave === 'off' || this.config.store.saveOutput.autoSave === 'ssh' && !(tab instanceof SSHTabComponent)) {
            return
        }

        if (tab.sessionChanged$) { // v136+
            tab.sessionChanged$.subscribe(session => {
                if (session) {
                    this.attachToSession(session, tab)
                }
            })
        }
        if (tab.session) {
            this.attachToSession(tab.session, tab)
        }
    }

    private attachToSession (session: BaseSession, tab: BaseTerminalTabComponent) {
        const sessionId = this.generateSessionId(tab)
        let currentInput = ''
        let isInputMode = true

        session.input$.subscribe(data => {
            if (isInputMode) {
                currentInput += data
            }
        })

        session.output$.subscribe(async data => {
            data = cleanupOutput(data)
            
            // If we receive output, we were in input mode and now switching to output mode
            if (isInputMode && data.length > 0) {
                isInputMode = false
                // Save the completed input command
                if (currentInput.trim()) {
                    await this.database.saveTerminalOutput(sessionId, currentInput.trim(), '')
                }
                currentInput = ''
            }

            // Save the output
            if (data.length > 0) {
                await this.database.saveTerminalOutput(sessionId, null, data)
            }

            // If we see a prompt character, switch back to input mode
            if (data.includes('$') || data.includes('#') || data.includes('>')) {
                isInputMode = true
            }
        })

        session.destroyed$.subscribe(() => {
            // Save any remaining input if session is destroyed
            if (currentInput.trim()) {
                this.database.saveTerminalOutput(sessionId, currentInput.trim(), '')
            }
        })
    }

    private generateSessionId (tab: BaseTerminalTabComponent): string {
        return `${new Date().toISOString()}-${tab.customTitle || tab.title || 'Untitled'}`
    }
}
