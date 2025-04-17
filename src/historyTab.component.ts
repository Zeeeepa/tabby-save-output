import { Component } from '@angular/core'
import { DatabaseService, TerminalRecord } from './database.service'

@Component({
    template: require('./historyTab.component.pug'),
    styles: [require('./historyTab.component.scss')],
})
export class HistoryTabComponent {
    sessions: string[] = []
    records: TerminalRecord[] = []
    selectedSession: string | null = null

    constructor(
        private databaseService: DatabaseService,
    ) {
        this.loadSessions()
    }

    private loadSessions() {
        this.sessions = this.databaseService.getRecentSessions()
        if (this.sessions.length > 0) {
            this.selectSession(this.sessions[0])
        }
    }

    selectSession(sessionId: string) {
        this.selectedSession = sessionId
        this.records = this.databaseService.getSessionRecords(sessionId)
    }

    getRecordClass(record: TerminalRecord): string {
        return record.is_error ? 'error-record' : ''
    }
}
