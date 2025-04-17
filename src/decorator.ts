import { Injectable } from '@angular/core'
import { TabContextMenuItemProvider, ConfigService } from 'tabby-core'
import { BaseTerminalTabComponent } from 'tabby-terminal'
import { SSHTabComponent } from 'tabby-ssh'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as sqlite3 from 'sqlite3'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class SaveOutputContextMenu extends TabContextMenuItemProvider {
    private sessionId: string = uuidv4()
    private db: sqlite3.Database | null = null

    constructor(
        private config: ConfigService,
    ) {
        super()
        this.initializeDB()
    }

    private async initializeDB() {
        if (this.config.store.saveOutput.dbConfig.host) {
            this.db = new sqlite3.Database(this.config.store.saveOutput.dbConfig.host)
        }
    }

    async saveOutput(tab: BaseTerminalTabComponent, data: string) {
        if (!this.db) {
            return
        }

        const command = tab.lastInput || ''
        const response = data

        return new Promise<void>((resolve, reject) => {
            this.db?.run(
                'INSERT INTO command_logs (command, response, session_id) VALUES (?, ?, ?)',
                [command, response, this.sessionId],
                (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                }
            )
        })
    }

    async provide(tab: BaseTerminalTabComponent) {
        if (this.config.store.saveOutput.autoSave === 'off' || 
            this.config.store.saveOutput.autoSave === 'ssh' && !(tab instanceof SSHTabComponent)) {
            return []
        }

        if (!this.db) {
            await this.initializeDB()
        }

        const sub = tab.output$.subscribe(data => {
            this.saveOutput(tab, data.toString())
        })

        tab.destroyed$.subscribe(() => {
            sub.unsubscribe()
            if (this.db) {
                this.db.close()
                this.db = null
            }
        })

        return []
    }
}
