import { ConfigProvider } from 'tabby-core'

/** @hidden */
export class SaveOutputConfigProvider extends ConfigProvider {
    defaults = {
        saveOutput: {
            autoSave: 'off',
            dbConfig: {
                type: 'sqlite',
                name: '',
                host: '',
                port: '',
                username: '',
                password: '',
                createNew: false,
            },
        },
    }

    platformDefaults = { }
}
