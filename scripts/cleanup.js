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

/**
 * Check if rimraf is available
 * @returns {boolean} True if rimraf is available, false otherwise
 */
function isRimrafAvailable() {
  try {
    // Try to check if rimraf is installed globally or locally
    execSync('npm list rimraf -g || npm list rimraf', { 
      stdio: 'ignore',
      cwd: rootDir 
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if node_modules exists
if (fs.existsSync(nodeModulesDir)) {
  console.log('Removing node_modules directory...');
  try {
    // On Windows, we might need to use rimraf or a similar tool
    // because some files might be locked
    if (process.platform === 'win32') {
      console.log('Running on Windows...');
      
      // Check if rimraf is available
      const rimrafAvailable = isRimrafAvailable();
      
      if (rimrafAvailable) {
        console.log('Using rimraf for Windows file deletion...');
        try {
          execSync('npx rimraf node_modules', { cwd: rootDir });
          console.log('Successfully removed node_modules using rimraf');
        } catch (error) {
          console.log(`Rimraf failed: ${error.message}`);
          console.log('Falling back to native deletion...');
          fs.rmSync(nodeModulesDir, { recursive: true, force: true });
        }
      } else {
        console.log('Rimraf not available, using native deletion...');
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
    console.log('Try running: rm -rf node_modules');
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
    console.log('You may need to manually delete the package-lock.json file');
  }
} else {
  console.log('package-lock.json does not exist, skipping removal');
}

console.log('Cleanup complete!');
console.log('You can now run "npm install" to reinstall dependencies');
