/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { DatabaseConfig } from './services/database.service'

interface SaveOutputConfig {
    autoStart: boolean
    database: DatabaseConfig
}

@Component({
    template: require('./settingsTab.component.pug'),
    styles: [require('./settingsTab.component.scss')],
})
export class SaveOutputSettingsTabComponent {
    config: SaveOutputConfig

    constructor(
        private configService: ConfigService,
    ) {
        this.config = this.configService.store.saveOutput || {
            autoStart: false,
            database: {
                type: 'sqlite',
                path: 'tabby-output.db',
                createIfNotExists: true
            }
        }
    }

    save() {
        this.configService.store.saveOutput = this.config
        this.configService.save()
    }

    toggleDatabaseType() {
        if (this.config.database.type === 'sqlite') {
            this.config.database = {
                type: 'custom',
                host: 'localhost',
                port: 5432,
                username: '',
                password: '',
                database: ''
            }
        } else {
            this.config.database = {
                type: 'sqlite',
                path: 'tabby-output.db',
                createIfNotExists: true
            }
        }
        this.save()
    }
}
