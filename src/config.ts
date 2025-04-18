import { ConfigProvider } from 'tabby-core'

/** @hidden */
export class SaveOutputConfigProvider extends ConfigProvider {
    defaults = {
        saveOutput: {
            autoSave: 'off',
            autoSaveDirectory: null,
            storageType: 'file', // 'file' or 'database'
            sshOnly: false,
            database: {
                type: 'sqlite',
                path: null,
                name: 'tabby_output',
                createNew: false,
            },
        },
    }

    platformDefaults = { }
}
