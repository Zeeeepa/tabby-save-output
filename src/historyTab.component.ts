import { Component } from '@angular/core'
import { DatabaseService, TerminalRecord } from './database.service'

@Component({
    template: require('./historyTab.component.pug'),
    styles: [require('./historyTab.component.scss')],
})
export class HistoryTabComponent {
    recentSessions: { sessionId: string, title: string, lastTimestamp: string }[] = []
    records: TerminalRecord[] = []
    searchQuery = ''
    selectedSessionId: string | null = null

    constructor(
        private dbService: DatabaseService,
    ) {
        this.loadRecentSessions()
    }

    loadRecentSessions() {
        this.recentSessions = this.dbService.getRecentSessions()
    }

    selectSession(sessionId: string) {
        this.selectedSessionId = sessionId
        this.records = this.dbService.getSessionRecords(sessionId)
    }

    search() {
        if (this.searchQuery.trim()) {
            this.selectedSessionId = null
            this.records = this.dbService.searchRecords(this.searchQuery)
        }
    }

    getFormattedTime(timestamp: string): string {
        return new Date(timestamp).toLocaleString()
    }
}
