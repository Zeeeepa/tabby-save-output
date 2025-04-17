import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SettingsTabProvider } from 'tabby-settings'

import { SaveOutputSettingsComponent } from './settings.component'
import { DatabaseService } from './services/database.service'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    providers: [
        { 
            provide: SettingsTabProvider,
            useClass: SaveOutputSettingsComponent,
            multi: true,
        },
        DatabaseService,
    ],
    declarations: [
        SaveOutputSettingsComponent,
    ],
})
export default class SaveOutputModule { }
