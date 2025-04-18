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
# If you encounter dependency conflicts, use:
npm install --legacy-peer-deps

# Build the plugin
npm run build
```

## Troubleshooting

### Dependency Conflicts

If you encounter dependency conflicts during installation, try one of these approaches:

1. Use the `--legacy-peer-deps` flag:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Use npm version 7 or higher which supports automatic dependency resolution:
   ```bash
   npm install -g npm@latest
   npm install
   ```

3. If you're still having issues, check that you have the correct Node.js version installed. This plugin works best with Node.js 14.x or 16.x.

### Windows-specific Issues

For Windows users:

1. If you encounter an error related to `pagent.exe`, the postinstall script should automatically fix this issue by:
   - First trying to copy the file from the ssh2 module if available
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

## Usage

After installation, you'll find a new "Save output" button in the terminal toolbar.

## License

MIT
