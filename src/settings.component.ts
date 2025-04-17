import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'

interface PluginConfig {
    autoSave: boolean
    errorDetection: boolean
    maxRecords: number
}

@Component({
    template: require('./settings.component.pug'),
})
export class SettingsTabComponent {
    config: PluginConfig

    constructor(
        private configService: ConfigService,
    ) {
        this.config = this.configService.store.saveOutput || {
            autoSave: true,
            errorDetection: true,
            maxRecords: 1000
        }
    }

    save() {
        this.configService.store.saveOutput = this.config
        this.configService.save()
    }
}
