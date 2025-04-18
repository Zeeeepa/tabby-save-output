import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import sanitizeFilename from 'sanitize-filename'
import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { TerminalDecorator, BaseTerminalTabComponent, BaseSession } from 'tabby-terminal'
import { SSHTabComponent } from 'tabby-ssh'
import { cleanupOutput } from './util'
import { DatabaseService } from './database'

@Injectable()
export class SaveOutputDecorator extends TerminalDecorator {
    constructor (
        private config: ConfigService,
        private databaseService: DatabaseService,
    ) {
        super()
    }

    attach (tab: BaseTerminalTabComponent): void {
        // Check if we should save output based on settings
        if (this.config.store.saveOutput.autoSave === 'off') {
            return
        }
        
        // Check if we should only save SSH output
        if (this.config.store.saveOutput.sshOnly && !(tab instanceof SSHTabComponent)) {
            return
        }

        if (tab.sessionChanged$) { // v136+
            tab.sessionChanged$.subscribe(session => {
                if (session) {
                    this.attachToSession(session, tab)
                }
            })
        }
        if (tab.session) {
            this.attachToSession(tab.session, tab)
        }
    }

    private async attachToSession (session: BaseSession, tab: BaseTerminalTabComponent) {
        const storageType = this.config.store.saveOutput.storageType || 'file'
        
        if (storageType === 'file') {
            this.attachToFileSystem(session, tab)
        } else if (storageType === 'database') {
            this.attachToDatabase(session, tab)
        }
    }

    private attachToFileSystem(session: BaseSession, tab: BaseTerminalTabComponent) {
        let outputPath = this.generatePath(tab)
        const stream = fs.createWriteStream(outputPath)
        let dataLength = 0

        // wait for the title to settle
        setTimeout(() => {
            let newPath = this.generatePath(tab)
            fs.rename(outputPath, newPath, err => {
                if (!err) {
                    outputPath = newPath
                }
            })
        }, 5000)

        session.output$.subscribe(data => {
            data = cleanupOutput(data)
            dataLength += data.length
            stream.write(data, 'utf8')
        })

        session.destroyed$.subscribe(() => {
            stream.close()
            if (!dataLength) {
                fs.unlink(outputPath, () => null)
            }
        })
    }

    private async attachToDatabase(session: BaseSession, tab: BaseTerminalTabComponent) {
        // Initialize database connection
        const initialized = await this.databaseService.initialize()
        if (!initialized) {
            console.error('Failed to initialize database connection')
            return
        }

        // Update session title after it settles
        setTimeout(() => {
            this.databaseService.updateSessionTitle(tab.customTitle || tab.title || 'Untitled')
                .catch(err => console.error('Failed to update session title:', err))
        }, 5000)

        // Subscribe to terminal output
        const subscription = session.output$.subscribe(data => {
            data = cleanupOutput(data)
            if (data.length > 0) {
                this.databaseService.saveOutput(data)
                    .catch(err => console.error('Failed to save output to database:', err))
            }
        })

        // Clean up on session destroy
        session.destroyed$.subscribe(() => {
            subscription.unsubscribe()
            this.databaseService.close()
                .catch(err => console.error('Failed to close database connection:', err))
        })
    }

    private generatePath (tab: BaseTerminalTabComponent): string {
        let outputPath = this.config.store.saveOutput.autoSaveDirectory || os.homedir()
        let outputName = new Date().toISOString() + ' - ' + (tab.customTitle || tab.title || 'Untitled') + '.txt'
        outputName = sanitizeFilename(outputName)
        return path.join(outputPath, outputName)
    }
}
