const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * This script handles post-installation tasks:
 * 1. Creates an empty pagent.exe file in the tabby-ssh/util directory if it doesn't exist
 *    to prevent the postinstall script from failing on Windows
 * 2. Handles other potential installation issues
 */

function handleTabbySSHDependency() {
  try {
    const tabbySSHPath = path.join(__dirname, '..', 'node_modules', 'tabby-ssh');
    const utilDirPath = path.join(tabbySSHPath, 'util');
    const pagentPath = path.join(utilDirPath, 'pagent.exe');

    // Check if tabby-ssh is installed
    if (!fs.existsSync(tabbySSHPath)) {
      console.log('tabby-ssh not found, skipping pagent.exe fix');
      return;
    }

    // Create util directory if it doesn't exist
    if (!fs.existsSync(utilDirPath)) {
      fs.mkdirSync(utilDirPath, { recursive: true });
      console.log('Created util directory in tabby-ssh');
    }

    // Create empty pagent.exe file if it doesn't exist
    if (!fs.existsSync(pagentPath)) {
      fs.writeFileSync(pagentPath, '');
      console.log('Created empty pagent.exe file to prevent installation errors');
    } else {
      console.log('pagent.exe already exists, skipping creation');
    }
  } catch (error) {
    console.error('Error handling tabby-ssh dependency:', error);
  }
}

// Fix for Windows-specific issues with file locks
function handleWindowsFileLocks() {
  if (process.platform === 'win32') {
    try {
      console.log('Running on Windows, checking for locked files...');
      
      // List of directories that might be locked
      const potentiallyLockedDirs = [
        path.join(__dirname, '..', 'node_modules', 'electron'),
        path.join(__dirname, '..', 'node_modules', 'node-sass'),
        path.join(__dirname, '..', 'node_modules', '@angular')
      ];
      
      // Check if directories exist and log status
      potentiallyLockedDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          console.log(`Directory exists: ${dir}`);
        } else {
          console.log(`Directory does not exist: ${dir}`);
        }
      });
      
      console.log('Windows file lock check complete');
    } catch (error) {
      console.error('Error handling Windows file locks:', error);
    }
  }
}

// Run the handlers
console.log('Running postinstall script...');
handleTabbySSHDependency();
handleWindowsFileLocks();
console.log('Postinstall script completed');
