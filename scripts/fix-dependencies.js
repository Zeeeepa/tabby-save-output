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

function updatePackageJson() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.overrides) {
      packageJson.overrides = {};
    }
    
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
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with dependency overrides');
    return true;
  } catch (error) {
    console.error('Failed to update package.json:', error.message);
    return false;
  }
}

function fixAngularCoreRxJSConflict() {
  try {
    console.log('Attempting to directly fix @angular/core RxJS peer dependency conflict...');
    
    const angularCorePath = path.join(__dirname, '..', 'node_modules', '@angular', 'core', 'package.json');
    
    if (fs.existsSync(angularCorePath)) {
      const packageJson = JSON.parse(fs.readFileSync(angularCorePath, 'utf8'));
      
      if (packageJson.peerDependencies && packageJson.peerDependencies.rxjs) {
        const originalVersion = packageJson.peerDependencies.rxjs;
        
        packageJson.peerDependencies.rxjs = '^6.5.3 || ^6.6.7';
        
        fs.writeFileSync(angularCorePath, JSON.stringify(packageJson, null, 2));
        console.log(`Updated @angular/core RxJS peer dependency from ${originalVersion} to ^6.5.3 || ^6.6.7`);
      }
    } else {
      console.log('@angular/core package.json not found, skipping direct fix');
    }
  } catch (error) {
    console.error('Error fixing @angular/core RxJS dependency:', error.message);
  }
}

async function main() {
  try {
    console.log('Step 1: Cleaning npm cache...');
    runCommand('npm cache clean --force');
    
    console.log('Step 2: Updating package.json with overrides...');
    if (!updatePackageJson()) {
      console.error('Failed to update package.json. Aborting.');
      return;
    }
    
    console.log('Step 3: Installing RxJS with exact version...');
    runCommand('npm install rxjs@6.6.7 --save-exact');
    
    console.log('Step 4: Directly fixing Angular Core RxJS peer dependency...');
    fixAngularCoreRxJSConflict();
    
    console.log('Step 5: Installing dependencies with force flag...');
    const installResult = runCommand('npm install --force');
    
    if (!installResult) {
      console.log('Force install failed. Trying with legacy-peer-deps...');
      const legacyResult = runCommand('npm install --legacy-peer-deps');
      
      if (!legacyResult) {
        console.log('\n===== MANUAL RESOLUTION REQUIRED =====');
        console.log('Both --force and --legacy-peer-deps installation methods failed.');
        console.log('Try the following manual steps:');
        console.log('1. Delete node_modules directory: rm -rf node_modules');
        console.log('2. Delete package-lock.json: rm package-lock.json');
        console.log('3. Install with specific flags: npm install --legacy-peer-deps --no-optional');
        console.log('4. If that fails, try: npm install --legacy-peer-deps --no-optional --ignore-scripts');
        console.log('=====================================\n');
      }
    }
    
    console.log('Dependency conflict resolution completed.');
    console.log('If you still encounter issues, please refer to the README.md troubleshooting section.');
  } catch (error) {
    console.error('An error occurred during dependency resolution:', error.message);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
