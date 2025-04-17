import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TerminalDecorator } from './terminal-decorator.service'
import { DatabaseService } from './database.service'
import { SettingsTabComponent } from './settings.component'
import { HistoryTabComponent } from './history.component'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    providers: [
        TerminalDecorator,
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

export { TerminalDecorator }
