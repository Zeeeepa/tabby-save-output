import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SettingsTabComponent } from './settingsTab.component'
import { HistoryTabComponent } from './historyTab.component'
import { SaveOutputDecorator } from './decorator'
import { DatabaseService } from './database.service'
import { TerminalDecorator } from 'tabby-terminal'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    providers: [
        { provide: TerminalDecorator, useClass: SaveOutputDecorator, multi: true },
        DatabaseService,
    ],
    declarations: [
        SettingsTabComponent,
        HistoryTabComponent,
    ],
    exports: [
        SettingsTabComponent,
        HistoryTabComponent,
    ],
})
export default class SaveOutputModule { }

export { SettingsTabComponent }
export { HistoryTabComponent }
export { SaveOutputDecorator }
export { DatabaseService }
