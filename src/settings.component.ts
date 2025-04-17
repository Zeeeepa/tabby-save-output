import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'

@Component({
    template: require('./settings.component.pug'),
})
export class SaveOutputSettingsComponent {
    constructor(
        public config: ConfigService,
    ) { }

    ngOnInit() {
        this.config.store.saveOutput = this.config.store.saveOutput || {}
        this.config.store.saveOutput.useDatabase = this.config.store.saveOutput.useDatabase || false
        this.config.store.saveOutput.createNewDb = this.config.store.saveOutput.createNewDb || false
        this.config.store.saveOutput.dbPath = this.config.store.saveOutput.dbPath || './terminal_output.db'
        this.config.store.saveOutput.dbType = this.config.store.saveOutput.dbType || 'better-sqlite3'
        this.config.store.saveOutput.dbHost = this.config.store.saveOutput.dbHost || 'localhost'
        this.config.store.saveOutput.dbUser = this.config.store.saveOutput.dbUser || ''
        this.config.store.saveOutput.dbPassword = this.config.store.saveOutput.dbPassword || ''
        this.config.store.saveOutput.dbName = this.config.store.saveOutput.dbName || ''
    }
}
