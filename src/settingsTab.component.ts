/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'

interface SaveOutputConfig {
    enabled: boolean
    sshOnly: boolean
    databasePath: string
}

@Component({
    template: require('./settingsTab.component.pug'),
})
export class SaveOutputSettingsTabComponent {
    config: SaveOutputConfig

    constructor(
        private configService: ConfigService,
    ) {
        this.config = this.configService.store.saveOutput || {
            enabled: false,
            sshOnly: false,
            databasePath: `${process.env.HOME}/.tabby/terminal_output.db`
        }
    }

    save() {
        this.configService.store.saveOutput = this.config
        this.configService.save()
    }
}
