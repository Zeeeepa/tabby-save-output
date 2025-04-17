import { Component, OnInit } from '@angular/core'
import { DatabaseService, TerminalIO } from '../services/database.service'
import { TerminalService } from '../services/terminal.service'

@Component({
    template: require('./history-viewer.component.pug'),
    styles: [require('./history-viewer.component.scss')],
})
export class HistoryViewerComponent implements OnInit {
    history: TerminalIO[] = []
    currentSessionId: string

    constructor(
        private databaseService: DatabaseService,
        private terminalService: TerminalService,
    ) {
        this.currentSessionId = this.terminalService.getSessionId()
    }

    ngOnInit() {
        this.loadHistory()

        // Subscribe to new output
        this.terminalService.getOutputStream().subscribe(() => {
            this.loadHistory()
        })
    }

    private loadHistory() {
        this.history = this.databaseService.getSessionHistory(this.currentSessionId)
    }

    getDisplayTime(timestamp: number): string {
        return new Date(timestamp).toLocaleTimeString()
    }

    getRowClass(entry: TerminalIO): string {
        if (entry.type === 'input') {
            return 'input-row'
        }
        if (entry.isIssue) {
            return 'issue-row'
        }
        if (entry.isError) {
            return 'error-row'
        }
        return ''
    }
}
