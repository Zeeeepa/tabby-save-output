/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { config } from './config'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
})
export class SaveOutputSettingsTabComponent {
    dbConfig: any

    constructor (
        public config: ConfigService,
    ) {
        this.dbConfig = this.config.store.saveOutput
        if (!this.dbConfig) {
            this.config.store.saveOutput = {
                autoSave: false,
                dbName: 'terminal_output',
                dbUser: '',
                dbPassword: '',
                dbHost: 'localhost'
            }
            this.dbConfig = this.config.store.saveOutput
        }
    }

    showDatabaseInfo(): boolean {
        return this.dbConfig.autoSave
    }
}
