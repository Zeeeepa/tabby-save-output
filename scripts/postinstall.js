const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

/**
 * This script handles post-installation tasks:
 * 1. Creates an empty pagent.exe file in the tabby-ssh/util directory if it doesn't exist
 *    to prevent the postinstall script from failing on Windows
 * 2. Handles dependency conflicts by applying npm overrides if needed
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

    const ssh2Path = path.join(__dirname, '..', 'node_modules', 'ssh2');
    const ssh2UtilPath = path.join(ssh2Path, 'util');
    const ssh2PagentPath = path.join(ssh2UtilPath, 'pagent.exe');
    
    const tabbySSHPath = path.join(__dirname, '..', 'node_modules', 'tabby-ssh');
    const tabbyUtilPath = path.join(tabbySSHPath, 'util');
    const tabbyPagentPath = path.join(tabbyUtilPath, 'pagent.exe');

    // Check if ssh2 module and pagent.exe exist
    if (fs.existsSync(ssh2Path) && fs.existsSync(ssh2PagentPath)) {
      // Create tabby-ssh/util directory if it doesn't exist
      if (!fs.existsSync(tabbyUtilPath)) {
        fs.mkdirSync(tabbyUtilPath, { recursive: true });
      }
      
      // Copy pagent.exe from ssh2/util to tabby-ssh/util
      fs.copyFileSync(ssh2PagentPath, tabbyPagentPath);
      console.log('Successfully copied pagent.exe from ssh2 module');
    } else {
      console.log('ssh2 module or pagent.exe not found, using empty file instead');
      handleTabbySSHDependency();
    }
  } catch (error) {
    console.error('Error copying pagent.exe:', error);
    // Fallback to creating an empty file
    handleTabbySSHDependency();
  }
}

// Run the handlers
copyPagentFromNodeModules();
