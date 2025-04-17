import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TerminalModule } from 'tabby-terminal'

import { HistoryViewerComponent } from './components/history-viewer.component'
import { DatabaseService } from './services/database.service'
import { TerminalService } from './services/terminal.service'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TerminalModule,
    ],
    providers: [
        DatabaseService,
        TerminalService,
    ],
    declarations: [
        HistoryViewerComponent,
    ],
    exports: [
        HistoryViewerComponent,
    ],
})
export class SaveOutputModule { }

export { HistoryViewerComponent } from './components/history-viewer.component'
export { DatabaseService } from './services/database.service'
export { TerminalService } from './services/terminal.service'
