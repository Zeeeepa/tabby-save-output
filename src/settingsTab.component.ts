/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { ElectronHostWindow, ElectronService } from 'tabby-electron'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
})
export class SaveOutputSettingsTabComponent {
    showDatabaseInfo = false

    constructor (
        public config: ConfigService,
        private electron: ElectronService,
        private hostWindow: ElectronHostWindow,
    ) {
        // Initialize database config if not exists
        if (!this.config.store.saveOutput) {
            this.config.store.saveOutput = {}
        }
        if (!this.config.store.saveOutput.databaseName) {
            this.config.store.saveOutput.databaseName = ''
            this.config.store.saveOutput.databaseHost = 'localhost'
            this.config.store.saveOutput.databasePort = 5432
            this.config.store.saveOutput.databaseUsername = ''
            this.config.store.saveOutput.databasePassword = ''
            this.config.save()
        }
    }

    toggleDatabaseInfo(): void {
        this.showDatabaseInfo = !this.showDatabaseInfo
    }

    async pickDirectory (): Promise<void> {
        const paths = (await this.electron.dialog.showOpenDialog(
            this.hostWindow.getWindow(),
            {
                properties: ['openDirectory', 'showHiddenFiles'],
            }
        )).filePaths
        if (paths[0]) {
            this.config.store.saveOutput.autoSaveDirectory = paths[0]
            this.config.save()
        }
    }
}
