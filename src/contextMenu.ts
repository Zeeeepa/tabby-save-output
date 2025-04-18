import * as fs from 'fs'
import { Injectable } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { MenuItemOptions, ConfigService } from 'tabby-core'
import { ElectronService, ElectronHostWindow } from 'tabby-electron'
import { BaseTerminalTabComponent, TerminalContextMenuItemProvider } from 'tabby-terminal'
import { cleanupOutput } from './util'
import { DatabaseService } from './database'

import './styles.scss'

@Injectable()
export class SaveOutputContextMenu extends TerminalContextMenuItemProvider {
    weight = 1

    constructor (
        private toastr: ToastrService,
        private electron: ElectronService,
        private hostWindow: ElectronHostWindow,
        private config: ConfigService,
        private databaseService: DatabaseService,
    ) {
        super()
    }

    async getItems (tab: BaseTerminalTabComponent): Promise<MenuItemOptions[]> {
        const storageType = this.config.store.saveOutput.storageType || 'file'
        
        const menuItems: MenuItemOptions[] = [
            {
                label: 'Save output to file...',
                click: () => {
                    setTimeout(() => {
                        this.saveToFile(tab)
                    })
                }
            },
        ]
        
        // Add database option if configured
        if (this.config.store.saveOutput.database?.path) {
            menuItems.push({
                label: 'Save output to database...',
                click: () => {
                    setTimeout(() => {
                        this.saveToDatabase(tab)
                    })
                }
            })
        }
        
        return menuItems
    }

    private saveToFile(tab: BaseTerminalTabComponent) {
        if ((tab as any)._saveOutputActive) {
            return
        }

        let path = this.electron.dialog.showSaveDialogSync(
            this.hostWindow.getWindow(),
            { defaultPath: 'terminal-log.txt' }
        )

        if (!path) {
            return
        }

        let ui: HTMLElement = document.createElement('div')
        ui.classList.add('save-output-ui')
        tab.element.nativeElement.querySelector('.content').appendChild(ui)
        ui.innerHTML = require('./ui.pug')

        let stream = fs.createWriteStream(path)

        let subscription = tab.output$.subscribe(data => {
            data = cleanupOutput(data)
            stream.write(data, 'utf8')
        })

        ;(tab as any)._saveOutputActive = true

        ui.querySelector('button').addEventListener('click', () => {
            (tab as any)._saveOutputActive = false
            tab.element.nativeElement.querySelector('.content').removeChild(ui)
            subscription.unsubscribe()
            stream.end()
            this.toastr.info('File saved')
        })
    }

    private async saveToDatabase(tab: BaseTerminalTabComponent) {
        if ((tab as any)._saveOutputActive) {
            return
        }

        // Initialize database connection
        const initialized = await this.databaseService.initialize()
        if (!initialized) {
            this.toastr.error('Failed to connect to database. Check your database settings.')
            return
        }

        // Update session title
        await this.databaseService.updateSessionTitle(tab.customTitle || tab.title || 'Untitled')
            .catch(err => {
                console.error('Failed to update session title:', err)
                this.toastr.error('Failed to update session title')
            })

        // Create UI indicator
        let ui: HTMLElement = document.createElement('div')
        ui.classList.add('save-output-ui')
        tab.element.nativeElement.querySelector('.content').appendChild(ui)
        ui.innerHTML = require('./ui.pug')
        
        // Change button text to indicate database saving
        const button = ui.querySelector('button')
        if (button) {
            button.textContent = 'Stop saving to database'
        }

        // Subscribe to terminal output
        let subscription = tab.output$.subscribe(data => {
            data = cleanupOutput(data)
            if (data.length > 0) {
                this.databaseService.saveOutput(data)
                    .catch(err => {
                        console.error('Failed to save output to database:', err)
                        this.toastr.error('Failed to save output to database')
                    })
            }
        })

        ;(tab as any)._saveOutputActive = true

        // Handle stop button click
        ui.querySelector('button').addEventListener('click', () => {
            (tab as any)._saveOutputActive = false
            tab.element.nativeElement.querySelector('.content').removeChild(ui)
            subscription.unsubscribe()
            this.databaseService.close()
                .catch(err => console.error('Failed to close database connection:', err))
            this.toastr.info('Database saving stopped')
        })
    }
}
