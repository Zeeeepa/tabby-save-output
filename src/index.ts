import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SettingsTabModule } from 'tabby-settings'

import { SaveOutputSettingsTabComponent } from './settingsTab.component'
import { SaveOutputDecorator } from './decorator'
import { DatabaseService } from './services/database.service'
import { ConfigService } from 'tabby-core'

/** @hidden */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SettingsTabModule,
    ],
    providers: [
        { provide: SaveOutputDecorator, useClass: SaveOutputDecorator },
        DatabaseService,
    ],
    declarations: [
        SaveOutputSettingsTabComponent,
    ],
    exports: [
        SaveOutputSettingsTabComponent,
    ],
})
export default class SaveOutputModule {
    constructor(
        private config: ConfigService,
    ) {
        config.store.saveOutput = config.store.saveOutput || {
            autoSave: false,
            dbName: 'terminal_output',
            dbUser: '',
            dbPassword: '',
            dbHost: 'localhost'
        }
    }
}
