import { Injectable } from '@angular/core'
import { TerminalDecorator, BaseTerminalTabComponent } from 'tabby-terminal'
import { DatabaseService } from './services/database.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class SaveOutputDecorator extends TerminalDecorator {
    private sessions: Map<BaseTerminalTabComponent, string> = new Map()

    constructor(
        private databaseService: DatabaseService,
    ) {
        super()
    }

    attach(terminal: BaseTerminalTabComponent): void {
        const sessionId = uuidv4()
        this.sessions.set(terminal, sessionId)
        
        this.databaseService.createSession(sessionId, terminal.title)

        const originalInput = terminal.input.bind(terminal)
        terminal.input = (data: string) => {
            this.databaseService.saveOutput(sessionId, 'input', data)
            return originalInput(data)
        }

        const originalWrite = terminal.write.bind(terminal)
        terminal.write = (data: string) => {
            this.databaseService.saveOutput(sessionId, 'response', data)
            return originalWrite(data)
        }
    }

    detach(terminal: BaseTerminalTabComponent): void {
        const sessionId = this.sessions.get(terminal)
        if (sessionId) {
            this.databaseService.closeSession(sessionId)
            this.sessions.delete(terminal)
        }
    }
}
