/**
 * This script helps fix dependency conflicts in the tabby-save-output plugin.
 * It specifically targets the RxJS and Angular dependency conflicts.
 * 
 * Usage:
 * node scripts/fix-dependencies.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting dependency conflict resolution script...');

// Function to execute npm commands safely
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Function to update package.json with overrides
function updatePackageJson() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Ensure overrides section exists
    if (!packageJson.overrides) {
      packageJson.overrides = {};
    }
    
    // Add or update RxJS-related overrides
    packageJson.overrides = {
      ...packageJson.overrides,
      '@ng-bootstrap/ng-bootstrap': {
        '@angular/common': '$@angular/common',
        '@angular/core': '$@angular/core',
        '@angular/forms': '$@angular/forms'
      },
      'ngx-toastr': {
        '@angular/core': '$@angular/core',
        '@angular/common': '$@angular/common',
        '@angular/animations': '$@angular/animations'
      },
      'tabby-core': {
        '@angular/core': '$@angular/core',
        '@angular/common': '$@angular/common',
        'rxjs': '$rxjs'
      },
      'tabby-terminal': {
        '@angular/core': '$@angular/core',
        '@angular/common': '$@angular/common',
        'rxjs': '$rxjs'
      },
      'tabby-settings': {
        '@angular/core': '$@angular/core',
        '@angular/common': '$@angular/common',
        '@angular/forms': '$@angular/forms',
        'rxjs': '$rxjs'
      },
      '@angular/core': {
        'rxjs': '$rxjs'
      },
      '@angular/common': {
        'rxjs': '$rxjs'
      }
    };
    
    // Write the updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with dependency overrides');
    return true;
  } catch (error) {
    console.error('Failed to update package.json:', error.message);
    return false;
  }
}

// Main execution flow
async function main() {
  try {
    // Step 1: Clean npm cache
    console.log('Step 1: Cleaning npm cache...');
    runCommand('npm cache clean --force');
    
    // Step 2: Update package.json with overrides
    console.log('Step 2: Updating package.json with overrides...');
    if (!updatePackageJson()) {
      console.error('Failed to update package.json. Aborting.');
      return;
    }
    
    // Step 3: Install RxJS with exact version
    console.log('Step 3: Installing RxJS with exact version...');
    runCommand('npm install rxjs@6.6.7 --save-exact');
    
    // Step 4: Install dependencies with force flag
    console.log('Step 4: Installing dependencies with force flag...');
    const installResult = runCommand('npm install --force');
    
    // Step 5: If force install failed, try legacy-peer-deps
    if (!installResult) {
      console.log('Force install failed. Trying with legacy-peer-deps...');
      runCommand('npm install --legacy-peer-deps');
    }
    
    console.log('Dependency conflict resolution completed.');
    console.log('If you still encounter issues, please refer to the README.md troubleshooting section.');
  } catch (error) {
    console.error('An error occurred during dependency resolution:', error.message);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
