# Tabby Save Output Plugin

This plugin lets you save the console output into a file or database.

## Features

- Save terminal output to files
- Stream terminal output to SQLite database
- Auto-save options for all terminals or SSH sessions only
- Context menu integration for on-demand saving

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

## Database Configuration

To use the database streaming feature:

1. Open Tabby settings
2. Navigate to the "Save Output" tab
3. Select "Database" as the Storage Type
4. Configure the SQLite database path and name
5. Click "Create New SQLite DB" if you want to create a new database
6. Click "Test Connection" to verify the database connection

## Usage

After installation, you'll find:

1. A new "Save Output" tab in the settings where you can configure:
   - Storage type (file or database)
   - Auto-save options
   - Database settings

2. Context menu options in the terminal:
   - "Save output to file..." - Saves the terminal output to a file
   - "Save output to database..." - Streams the terminal output to the configured database

## Database Schema

The plugin creates the following tables in the SQLite database:

### Sessions Table
```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE,
    tab_title TEXT,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Terminal Output Table
```sql
CREATE TABLE terminal_output (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    output TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
)
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

### Database Issues

If you encounter issues with the database functionality:

1. Make sure you have write permissions to the specified database directory
2. Check that the SQLite3 module is properly installed
3. Try creating a new database in a different location
4. Check the console for specific error messages

## License

MIT
