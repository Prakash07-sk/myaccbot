#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building MyACCOBot with Python backend...');

// Apply backend fix to use development Python
console.log('🔧 Applying backend fix...');
await runCommand('node', ['scripts/fix-backend.js']);

// Build frontend
console.log('📦 Building frontend...');
await runCommand('npm', ['run', 'build']);

// Build Electron app with Server directory included
console.log('⚡ Building Electron app...');
await runCommand('npm', ['run', 'build:mac']);

console.log('✅ Build completed! The app will use the development Python backend.');

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
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
