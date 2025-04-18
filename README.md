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

If you encounter dependency conflicts during installation, try one of these approaches:

1. Use the `--legacy-peer-deps` flag:
   ```bash
   npm install --legacy-peer-deps
   ```

2. If you're still having issues, check that you have the correct Node.js version installed. This plugin works best with Node.js 14.x or 16.x.

3. For Windows users: If you encounter an error related to `pagent.exe`, the postinstall script should automatically fix this issue. If not, you can manually create an empty file at `node_modules/tabby-ssh/util/pagent.exe`.

## Usage

After installation, you'll find a new "Save output" button in the terminal toolbar.

## License

MIT
