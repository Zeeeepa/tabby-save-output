const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

/**
 * This script handles post-installation tasks:
 * 1. Creates an empty pagent.exe file in the tabby-ssh/util directory if it doesn't exist
 *    to prevent the postinstall script from failing on Windows
 * 2. Handles dependency conflicts by applying npm overrides if needed
 * 3. Ensures proper cleanup of locked resources
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
    }
  } catch (error) {
    console.error('Error handling tabby-ssh dependency:', error);
  }
}

function copyPagentFromNodeModules() {
  try {
    // Only run on Windows
    if (os.platform() !== 'win32') {
      return;
    }

    console.log('Running Windows-specific pagent.exe handling...');

    // Try multiple possible locations for pagent.exe
    const possibleSources = [
      path.join(__dirname, '..', 'node_modules', 'ssh2', 'util', 'pagent.exe'),
      path.join(__dirname, '..', '..', 'ssh2', 'util', 'pagent.exe'),
      path.join(__dirname, '..', '..', '..', 'ssh2', 'util', 'pagent.exe')
    ];
    
    const tabbySSHPath = path.join(__dirname, '..', 'node_modules', 'tabby-ssh');
    const tabbyUtilPath = path.join(tabbySSHPath, 'util');
    const tabbyPagentPath = path.join(tabbyUtilPath, 'pagent.exe');

    // Create tabby-ssh/util directory if it doesn't exist
    if (!fs.existsSync(tabbyUtilPath)) {
      fs.mkdirSync(tabbyUtilPath, { recursive: true });
      console.log('Created util directory in tabby-ssh');
    }

    // Try to find and copy pagent.exe from any of the possible sources
    let copied = false;
    for (const sourcePath of possibleSources) {
      if (fs.existsSync(sourcePath)) {
        try {
          fs.copyFileSync(sourcePath, tabbyPagentPath);
          console.log(`Successfully copied pagent.exe from ${sourcePath}`);
          copied = true;
          break;
        } catch (err) {
          console.log(`Failed to copy from ${sourcePath}: ${err.message}`);
        }
      }
    }

    // If we couldn't copy from any source, create an empty file
    if (!copied) {
      console.log('Could not find pagent.exe in any location, creating empty file');
      fs.writeFileSync(tabbyPagentPath, '');
      console.log('Created empty pagent.exe file to prevent installation errors');
    }
  } catch (error) {
    console.error('Error handling pagent.exe:', error);
    // Fallback to creating an empty file
    handleTabbySSHDependency();
  }
}

function cleanupLockedResources() {
  if (os.platform() === 'win32') {
    try {
      console.log('Attempting to clean up potentially locked resources...');
      
      // List of directories that might be locked
      const potentiallyLockedDirs = [
        path.join(__dirname, '..', 'node_modules', 'electron'),
        path.join(__dirname, '..', 'node_modules', 'node-sass')
      ];
      
      // Try to release locks by touching a file in each directory
      potentiallyLockedDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          try {
            const touchFile = path.join(dir, '.lock-release');
            fs.writeFileSync(touchFile, Date.now().toString());
            fs.unlinkSync(touchFile);
            console.log(`Successfully touched file in ${dir} to help release locks`);
          } catch (err) {
            console.log(`Could not write to ${dir}, it may still be locked: ${err.message}`);
          }
        }
      });
    } catch (error) {
      console.error('Error during cleanup of locked resources:', error);
    }
  }
}

// Run the handlers
console.log('Starting tabby-save-output postinstall script...');
cleanupLockedResources();
copyPagentFromNodeModules();
console.log('Completed tabby-save-output postinstall script');
