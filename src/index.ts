import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SettingsTabProvider } from 'tabby-settings'

import { SaveOutputSettingsTabComponent } from './settingsTab.component'
import { DatabaseService } from './services/database.service'
import { TerminalDecorator } from './terminal-decorator.service'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    providers: [
        DatabaseService,
        TerminalDecorator,
        { provide: SettingsTabProvider, useClass: SaveOutputSettingsTabComponent, multi: true },
    ],
    declarations: [
        SaveOutputSettingsTabComponent,
    ],
})
export default class SaveOutputModule { }
