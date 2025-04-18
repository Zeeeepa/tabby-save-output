## Tabby Save Output Plugin

This plugin for [Tabby](https://github.com/Eugeny/tabby) (formerly Terminus) allows you to save terminal output to a file.

### Features

* Save terminal output to a file
* Append to existing files
* Stream output in real-time
* Configurable file paths
* Supports SQLite storage for large outputs

### Installation

```bash
git clone https://github.com/Zeeeepa/tabby-save-output.git
cd tabby-save-output
npm install
npm run build
```

### Troubleshooting Dependency Conflicts

If you encounter dependency conflicts during installation, try one of these approaches:

1. **Use the automated fix script** (recommended):
   ```bash
   npm run fix-deps
   npm run build
   ```

2. **Use the latest version of this repository** which includes fixes for dependency conflicts:
   ```bash
   git pull
   git checkout origin/codegen-bot/fix-dependency-conflicts-v7
   npm install
   ```

3. **Use the `--legacy-peer-deps` flag** (older approach):
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Use npm version 7 or higher** which supports automatic dependency resolution:
   ```bash
   npm install -g npm@latest
   npm install
   ```

5. **For RxJS and Angular compatibility issues**:
   If you're experiencing dependency conflicts like the one below:
   ```
   npm error code ERESOLVE
   npm error ERESOLVE unable to resolve dependency tree
   npm error Found: rxjs@6.6.7
   npm error Could not resolve dependency:
   npm error peer overridden rxjs@"^6.6.7" (was "^6.5.3") from @angular/core@9.1.13
   ```
   
   Try these specific steps:
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm run fix-deps
   npm install rxjs@6.6.7 --save-exact
   npm install --force
   ```

6. If you're still having issues, check that you have the correct Node.js version installed. This plugin works best with Node.js 14.x or 16.x.

### Windows-specific Issues

If you encounter issues on Windows related to node-gyp, node-sass, or other native modules:

1. Install the required build tools:
   ```
   npm install --global --production windows-build-tools
   ```

2. If you get errors about Python, make sure Python 2.7 is installed and in your PATH.

3. For issues with node-sass, try:
   ```
   npm rebuild node-sass
   ```

### Usage

1. Open Tabby (Terminus)
2. Open the plugin settings
3. Configure the output file path
4. Use the "Save Output" button in the terminal toolbar or the keyboard shortcut

### License

MIT
