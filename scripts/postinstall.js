const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function handleTabbySSHDependency() {
  try {
    const tabbySSHPath = path.join(__dirname, '..', 'node_modules', 'tabby-ssh');
    const utilDirPath = path.join(tabbySSHPath, 'util');
    const pagentPath = path.join(utilDirPath, 'pagent.exe');

    if (!fs.existsSync(tabbySSHPath)) {
      console.log('tabby-ssh not found, skipping pagent.exe fix');
      return;
    }

    if (!fs.existsSync(utilDirPath)) {
      fs.mkdirSync(utilDirPath, { recursive: true });
      console.log('Created util directory in tabby-ssh');
    }

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
    if (os.platform() !== 'win32') {
      return;
    }

    console.log('Running Windows-specific pagent.exe handling...');

    const possibleSources = [
      path.join(__dirname, '..', 'node_modules', 'ssh2', 'util', 'pagent.exe'),
      path.join(__dirname, '..', '..', 'ssh2', 'util', 'pagent.exe'),
      path.join(__dirname, '..', '..', '..', 'ssh2', 'util', 'pagent.exe')
    ];
    
    const tabbySSHPath = path.join(__dirname, '..', 'node_modules', 'tabby-ssh');
    const tabbyUtilPath = path.join(tabbySSHPath, 'util');
    const tabbyPagentPath = path.join(tabbyUtilPath, 'pagent.exe');

    if (!fs.existsSync(tabbyUtilPath)) {
      fs.mkdirSync(tabbyUtilPath, { recursive: true });
      console.log('Created util directory in tabby-ssh');
    }

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

    if (!copied) {
      console.log('Could not find pagent.exe in any location, creating empty file');
      fs.writeFileSync(tabbyPagentPath, '');
      console.log('Created empty pagent.exe file to prevent installation errors');
    }
  } catch (error) {
    console.error('Error handling pagent.exe:', error);
    handleTabbySSHDependency();
  }
}

function cleanupLockedResources() {
  if (os.platform() === 'win32') {
    try {
      console.log('Attempting to clean up potentially locked resources...');
      
      const potentiallyLockedDirs = [
        path.join(__dirname, '..', 'node_modules', 'electron'),
        path.join(__dirname, '..', 'node_modules', 'node-sass')
      ];
      
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

function fixRxJSDependencyConflicts() {
  try {
    console.log('Checking for RxJS dependency conflicts...');
    
    const packageJsonPaths = [
      path.join(__dirname, '..', 'node_modules', '@angular', 'core', 'package.json'),
      path.join(__dirname, '..', 'node_modules', '@angular', 'common', 'package.json'),
      path.join(__dirname, '..', 'node_modules', '@ng-bootstrap', 'ng-bootstrap', 'package.json'),
      path.join(__dirname, '..', 'node_modules', 'tabby-core', 'package.json'),
      path.join(__dirname, '..', 'node_modules', 'tabby-terminal', 'package.json'),
      path.join(__dirname, '..', 'node_modules', 'tabby-settings', 'package.json')
    ];
    
    packageJsonPaths.forEach(packageJsonPath => {
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          
          if (packageJson.peerDependencies && packageJson.peerDependencies.rxjs) {
            const originalVersion = packageJson.peerDependencies.rxjs;
            
            if (originalVersion !== '^6.5.3 || ^6.6.7' && 
                originalVersion !== '^6.6.7' && 
                !originalVersion.includes('6.6.7')) {
              
              packageJson.peerDependencies.rxjs = '^6.5.3 || ^6.6.7';
              
              fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
              console.log(`Updated RxJS peer dependency in ${packageJsonPath} from ${originalVersion} to ^6.5.3 || ^6.6.7`);
            }
          }
        } catch (err) {
          console.log(`Error processing ${packageJsonPath}: ${err.message}`);
        }
      }
    });
    
    console.log('RxJS dependency conflict check completed');
  } catch (error) {
    console.error('Error fixing RxJS dependency conflicts:', error);
  }
}

console.log('Starting tabby-save-output postinstall script...');
cleanupLockedResources();
copyPagentFromNodeModules();
fixRxJSDependencyConflicts();
console.log('Completed tabby-save-output postinstall script');
