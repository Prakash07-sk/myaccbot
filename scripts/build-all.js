#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLATFORMS = {
  win32: 'win',
  darwin: 'mac',
  linux: 'linux'
};

const ARCHITECTURES = {
  x64: 'x64',
  arm64: 'arm64',
  ia32: 'ia32'
};

// Get current platform and architecture
const currentPlatform = os.platform();
const currentArch = os.arch();

console.log(`🚀 Building MyACCOBot for ${currentPlatform} (${currentArch})`);

// Build functions
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function buildFrontend() {
  console.log('🎨 Building frontend...');
  await runCommand('npm', ['run', 'build']);
}

async function buildBackend() {
  console.log('🐍 Building Python backend...');
  try {
    await runCommand('npm', ['run', 'build:backend']);
  } catch (error) {
    console.log('Node.js build failed, trying Python build...');
    await runCommand('npm', ['run', 'build:backend:py']);
  }
}

async function applyBackendFix() {
  console.log('🔧 Applying backend fix...');
  await runCommand('node', ['scripts/fix-backend.js']);
}

async function buildElectron() {
  console.log('⚡ Building Electron app...');
  
  const platform = PLATFORMS[currentPlatform];
  if (!platform) {
    throw new Error(`Unsupported platform: ${currentPlatform}`);
  }

  const buildCommand = `build:${platform}`;
  await runCommand('npm', ['run', buildCommand]);
}

async function cleanBuild() {
  console.log('🧹 Cleaning previous builds...');
  await runCommand('npm', ['run', 'clean']);
}

async function installDependencies() {
  console.log('📦 Installing dependencies...');
  await runCommand('npm', ['install']);
}

async function installServerDependencies() {
  console.log('🐍 Installing server dependencies...');
  await runCommand('npm', ['run', 'install:server']);
}

// Main build function
async function buildAll() {
  try {
    console.log('🚀 Starting complete build process...');
    console.log(`   Platform: ${currentPlatform}`);
    console.log(`   Architecture: ${currentArch}`);
    console.log(`   Target: ${PLATFORMS[currentPlatform] || 'unknown'}`);
    
    // Clean previous builds
    await cleanBuild();
    
    // Install dependencies
    await installDependencies();
    await installServerDependencies();
    
    // Build frontend
    await buildFrontend();
    
    // Build backend
    await buildBackend();
    
    // Apply backend fix
    await applyBackendFix();
    
    // Build Electron app
    await buildElectron();
    
    console.log('🎉 Build completed successfully!');
    console.log('📁 Check the release/ directory for the built application');
    
  } catch (error) {
    console.error('💥 Build failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'frontend':
    buildFrontend().catch(console.error);
    break;
  case 'backend':
    buildBackend().catch(console.error);
    break;
  case 'electron':
    buildElectron().catch(console.error);
    break;
  case 'clean':
    cleanBuild().catch(console.error);
    break;
  case 'deps':
    installDependencies().then(() => installServerDependencies()).catch(console.error);
    break;
  default:
    buildAll().catch(console.error);
}
