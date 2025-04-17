import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SettingsTabComponent } from './settingsTab.component'
import { HistoryTabComponent } from './historyTab.component'
import { SaveOutputDecorator } from './decorator'
import { DatabaseService } from './database.service'
import { ConfigService, ToolbarButtonProvider, TabRecoveryProvider, HotkeyProvider } from 'tabby-core'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    providers: [
        { provide: TabRecoveryProvider, useExisting: SaveOutputDecorator, multi: true },
        { provide: HotkeyProvider, useExisting: SaveOutputDecorator, multi: true },
        DatabaseService,
    ],
    entryComponents: [
        SettingsTabComponent,
        HistoryTabComponent,
    ],
    declarations: [
        SettingsTabComponent,
        HistoryTabComponent,
    ],
})
export default class SaveOutputModule { }

export { SaveOutputDecorator }
