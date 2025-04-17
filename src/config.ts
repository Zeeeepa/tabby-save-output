import { ConfigProvider } from 'tabby-core'

/** @hidden */
export class SaveOutputConfigProvider extends ConfigProvider {
    defaults = {
        saveOutput: {
            autoSave: 'off',
            autoSaveDirectory: null,
            storageType: 'file', // 'file' or 'database'
            database: {
                type: 'sqlite',
                path: null,
                name: null,
                username: null,
                password: null,
                createNew: false,
            },
        },
    }

    platformDefaults = { }
}
