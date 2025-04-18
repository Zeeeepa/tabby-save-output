const fs = require('fs');
const path = require('path');

/**
 * This script handles post-installation tasks:
 * 1. Creates an empty pagent.exe file in the tabby-ssh/util directory if it doesn't exist
 *    to prevent the postinstall script from failing on Windows
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

// Run the handlers
handleTabbySSHDependency();
