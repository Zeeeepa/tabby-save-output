const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * This script helps clean up node_modules in case of installation issues
 * It's particularly useful for Windows users who might encounter file lock issues
 */

console.log('Starting cleanup process...');

// Define paths
const rootDir = path.join(__dirname, '..');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const packageLockFile = path.join(rootDir, 'package-lock.json');

// Check if node_modules exists
if (fs.existsSync(nodeModulesDir)) {
  console.log('Removing node_modules directory...');
  try {
    // On Windows, we might need to use rimraf or a similar tool
    // because some files might be locked
    if (process.platform === 'win32') {
      console.log('Using rimraf for Windows...');
      try {
        // Try to use rimraf if available
        execSync('npx rimraf node_modules', { cwd: rootDir });
      } catch (error) {
        console.log('Rimraf failed, trying native deletion...');
        fs.rmSync(nodeModulesDir, { recursive: true, force: true });
      }
    } else {
      // On Unix-like systems, we can use fs.rmSync
      fs.rmSync(nodeModulesDir, { recursive: true, force: true });
    }
    console.log('Successfully removed node_modules directory');
  } catch (error) {
    console.error('Error removing node_modules:', error.message);
    console.log('You may need to manually delete the node_modules directory');
  }
} else {
  console.log('node_modules directory does not exist, skipping removal');
}

// Check if package-lock.json exists
if (fs.existsSync(packageLockFile)) {
  console.log('Removing package-lock.json...');
  try {
    fs.unlinkSync(packageLockFile);
    console.log('Successfully removed package-lock.json');
  } catch (error) {
    console.error('Error removing package-lock.json:', error.message);
  }
} else {
  console.log('package-lock.json does not exist, skipping removal');
}

console.log('Cleanup complete!');
console.log('You can now run "npm install" to reinstall dependencies');
