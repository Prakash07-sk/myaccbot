#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DIR = path.join(__dirname, '../Server');
const DIST_DIR = path.join(__dirname, '../dist');
const BACKEND_DIST_DIR = path.join(SERVER_DIR, 'dist');

// Platform-specific executable names
const getExecutableName = () => {
  const platform = os.platform();
  
  if (platform === 'win32') {
    return 'myaccobot-backend.exe';
  } else {
    return 'myaccobot-backend'; // PyInstaller creates the same name for all Unix platforms
  }
};

// Clean previous builds
const cleanBuild = () => {
  console.log('🧹 Cleaning previous builds...');
  
  const dirsToClean = [
    BACKEND_DIST_DIR,
    path.join(SERVER_DIR, 'build'),
    path.join(SERVER_DIR, '__pycache__'),
  ];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`   Removed: ${dir}`);
    }
  });
};

// Check if Python virtual environment exists
const checkVenv = () => {
  const venvPath = path.join(SERVER_DIR, 'venv');
  if (!fs.existsSync(venvPath)) {
    console.error('❌ Python virtual environment not found!');
    console.error('   Please run: cd Server && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt');
    process.exit(1);
  }
  return venvPath;
};

// Install PyInstaller if not present
const installPyInstaller = (venvPath) => {
  return new Promise((resolve, reject) => {
    console.log('📦 Checking PyInstaller installation...');
    
    const pipPath = os.platform() === 'win32' 
      ? path.join(venvPath, 'Scripts', 'pip.exe')
      : path.join(venvPath, 'bin', 'pip3');
    
    // Check if PyInstaller is already installed
    exec(`${pipPath} show pyinstaller`, { cwd: SERVER_DIR }, (error, stdout, stderr) => {
      if (!error) {
        console.log('✅ PyInstaller is already installed');
        resolve();
        return;
      }
      
      // Install PyInstaller
      console.log('📦 Installing PyInstaller...');
      exec(`${pipPath} install pyinstaller`, { cwd: SERVER_DIR }, (installError, installStdout, installStderr) => {
        if (installError) {
          console.error('❌ Failed to install PyInstaller:', installError.message);
          reject(installError);
          return;
        }
        console.log('✅ PyInstaller installed successfully');
        resolve();
      });
    });
  });
};

// Build the Python executable
const buildExecutable = (venvPath) => {
  return new Promise((resolve, reject) => {
    console.log('🔨 Building Python executable...');
    
    const pyinstallerPath = os.platform() === 'win32' 
      ? path.join(venvPath, 'Scripts', 'pyinstaller.exe')
      : path.join(venvPath, 'bin', 'pyinstaller');
    
    const child = spawn(pyinstallerPath, ['main.spec'], { 
      cwd: SERVER_DIR,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Python executable built successfully');
        resolve();
      } else {
        console.error(`❌ Build failed with exit code ${code}`);
        reject(new Error(`Build failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error('❌ Build process error:', error.message);
      reject(error);
    });
  });
};

// Copy executable to dist directory
const copyExecutable = () => {
  console.log('📋 Copying executable to dist directory...');
  
  const executableName = getExecutableName();
  const sourcePath = path.join(BACKEND_DIST_DIR, executableName);
  const targetPath = path.join(DIST_DIR, 'backend', executableName);
  
  // Create backend directory in dist
  const backendDir = path.join(DIST_DIR, 'backend');
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied ${executableName} to dist/backend/`);
    
    // Make executable on Unix systems
    if (os.platform() !== 'win32') {
      fs.chmodSync(targetPath, '755');
    }
  } else {
    console.error(`❌ Executable not found at ${sourcePath}`);
    throw new Error('Executable not found');
  }
};

// Main build function
const buildBackend = async () => {
  try {
    console.log('🚀 Starting backend build process...');
    console.log(`   Platform: ${os.platform()}`);
    console.log(`   Architecture: ${os.arch()}`);
    console.log(`   Executable name: ${getExecutableName()}`);
    
    cleanBuild();
    const venvPath = checkVenv();
    await installPyInstaller(venvPath);
    await buildExecutable(venvPath);
    copyExecutable();
    
    console.log('🎉 Backend build completed successfully!');
    console.log(`   Executable location: ${path.join(DIST_DIR, 'backend', getExecutableName())}`);
    
  } catch (error) {
    console.error('💥 Backend build failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildBackend();
}

export { buildBackend, getExecutableName };
