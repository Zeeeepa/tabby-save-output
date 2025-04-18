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

1. **Use the `--legacy-peer-deps` flag**:

1. **Use the latest version of this repository** which includes fixes for dependency conflicts:
   ```bash
   git pull
   git checkout origin/codegen-bot/fix-dependency-conflicts-v7
   npm install
   ```

2. **Use the `--legacy-peer-deps` flag** (older approach):
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Clean installation using the cleanup script**:
   ```bash
   # Run the cleanup script to remove node_modules and package-lock.json
   npm run cleanup
   
   # Reinstall dependencies
   npm install
   ```

3. **Manual cleanup**:
   ```bash
   # Remove node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   
   # Reinstall dependencies
   npm install
   ```

4. **Node.js version**: This plugin works best with Node.js 14.x or 16.x.

### Windows-Specific Issues

If you're on Windows and encounter errors:

1. **File lock errors**: If you see errors about files being locked or busy, try closing any applications that might be using the files, or restart your computer.

2. **pagent.exe error**: The postinstall script should automatically fix this issue by creating an empty pagent.exe file. If you still encounter this error, you can manually create an empty file at `node_modules/tabby-ssh/util/pagent.exe`.

3. **Permission issues**: Try running the command prompt or terminal as administrator.
=======
3. **Use npm version 7 or higher** which supports automatic dependency resolution:
   ```bash
   npm install -g npm@latest
   npm install
   ```

4. If you're still having issues, check that you have the correct Node.js version installed. This plugin works best with Node.js 14.x or 16.x.

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

## Features

- Save terminal output to a file
- Configure output file location
- Strip ANSI color codes (optional)
- Append to existing files (optional)

## License

MIT
