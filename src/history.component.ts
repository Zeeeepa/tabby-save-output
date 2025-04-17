import { Component } from '@angular/core'
import { DatabaseService, TerminalRecord } from './database.service'

@Component({
    template: require('./history.component.pug'),
    styles: [require('./history.component.scss')],
})
export class HistoryTabComponent {
    records: TerminalRecord[] = []
    errorRecords: TerminalRecord[] = []
    activeTab: 'all' | 'errors' = 'all'

    constructor(
        private database: DatabaseService
    ) {
        this.loadRecords()
    }

    loadRecords() {
        if (this.activeTab === 'all') {
            this.records = this.database.getRecentRecords()
        } else {
            this.records = this.database.getErrorRecords()
        }
    }

    switchTab(tab: 'all' | 'errors') {
        this.activeTab = tab
        this.loadRecords()
    }

    getFormattedTime(timestamp: string): string {
        return new Date(timestamp).toLocaleString()
    }

    getErrorClass(record: TerminalRecord): string {
        return record.isError ? 'error-record' : ''
    }
}
