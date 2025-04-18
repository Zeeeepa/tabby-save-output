# Tabby Save Output Plugin

This plugin lets you save the console output into a file.

## Installation

```bash
# Clone the repository
git clone https://github.com/Zeeeepa/tabby-save-output.git

# Navigate to the directory
cd tabby-save-output

# Install dependencies
npm install

# Build the plugin
npm run build
```

## Troubleshooting

### Dependency Conflicts

If you encounter dependency conflicts during installation, try one of these approaches:

1. **Use the automated fix script** (recommended):
   ```bash
   # Run the dependency fix script
   npm run fix-deps
   
   # Then build the plugin
   npm run build
   ```

2. **Use the latest version of this repository** which includes fixes for dependency conflicts:
   ```bash
   git pull
   git checkout origin/codegen-bot/fix-dependency-conflicts-v8
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

5. **For RxJS and Angular conflicts specifically**, try:
   ```bash
   # Force the specific version of RxJS that works with Angular 9
   npm install rxjs@6.6.7 --save-exact
   
   # Then install with overrides
   npm install --force
   ```

6. If you're still having issues, check that you have the correct Node.js version installed. This plugin works best with Node.js 14.x or 16.x.

### Windows-specific Issues

For Windows users:

1. If you encounter an error related to `pagent.exe`, the enhanced postinstall script should automatically fix this issue by:
   - First trying to copy the file from the ssh2 module if available
   - Searching in multiple possible locations for the file
   - Creating an empty file at `node_modules/tabby-ssh/util/pagent.exe` if needed

2. If you still encounter the error, you can manually create the file:
   ```bash
   mkdir -p node_modules/tabby-ssh/util
   type nul > node_modules/tabby-ssh/util/pagent.exe
   ```

3. If you see "File not found - pagent.exe" errors, try running:
   ```bash
   npm rebuild
   ```

### Resource Busy or Locked Errors

If you see "EBUSY: resource busy or locked" errors:

1. Close any applications that might be using the files (like VS Code, Electron apps, etc.)
2. Try running the installation with administrator privileges
3. Restart your computer and try again
4. If the issue persists, try the following steps:
   ```bash
   # Delete the problematic directories if they exist
   rm -rf node_modules/electron
   rm -rf node_modules/node-sass
   
   # Reinstall with the force flag
   npm install --force
   ```

5. On Windows, you can also try:
   ```bash
   # Run as administrator
   npm cache clean --force
   npm install
   ```

## Usage

After installation, you'll find a new "Save output" button in the terminal toolbar.

## License

MIT
