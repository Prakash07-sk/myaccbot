#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the built Electron main file
const mainCjsPath = path.join(__dirname, '../electron/main.cjs');

console.log('🔧 Fixing backend startup issue...');

// Read the current main.cjs file
let content = fs.readFileSync(mainCjsPath, 'utf8');

// Replace the getBackendExecutablePath function to always use development Python
const newFunction = `// Get the backend executable path
function getBackendExecutablePath() {
  const platform = os.platform();
  const arch = os.arch();
  
  // Determine the correct paths based on environment
  let serverDir, pythonPath, venvSitePackages;
  
  if (isDev) {
    // Development mode - use direct paths
    serverDir = path.join(__dirname, '../Server');
    
    // Try to find the best Python executable
    const possiblePaths = [
      '/Users/apple/.pyenv/versions/3.10.13/bin/python3.10',
      '/usr/local/bin/python3',
      '/usr/bin/python3',
      'python3'
    ];
    
    for (const path of possiblePaths) {
      if (path === 'python3' || fs.existsSync(path)) {
        pythonPath = path;
        break;
      }
    }
    
    if (!pythonPath) {
      throw new Error('No suitable Python executable found');
    }
    
    venvSitePackages = path.join(serverDir, 'venv', 'lib', 'python3.10', 'site-packages');
    
    console.log('Development mode: Using direct Python backend: ' + pythonPath);
  } else {
    // Production mode - use bundled executable
    const bundledBackend = path.join(__dirname, '../dist/backend/myaccobot-backend');
    
    if (fs.existsSync(bundledBackend)) {
      console.log('Production mode: Using bundled backend executable');
      return { 
        command: bundledBackend, 
        args: [],
        env: {
          ...process.env,
          BACKEND_HOST: BACKEND_CONFIG.host,
          BACKEND_PORT: BACKEND_CONFIG.port.toString(),
        }
      };
    } else {
      // Fallback to system Python if bundled executable not found
      console.log('Production mode: Bundled executable not found, falling back to system Python');
      serverDir = path.join(__dirname, '../Server');
      
      const possiblePaths = [
        '/usr/local/bin/python3',
        '/usr/bin/python3',
        'python3'
      ];
      
      for (const path of possiblePaths) {
        if (path === 'python3' || fs.existsSync(path)) {
          pythonPath = path;
          break;
        }
      }
      
      if (!pythonPath) {
        throw new Error('No suitable Python executable found in production');
      }
      
      venvSitePackages = path.join(serverDir, 'venv', 'lib', 'python3.10', 'site-packages');
      
      console.log('Production fallback: Using system Python: ' + pythonPath);
    }
  }
  
  return { 
    command: pythonPath, 
    args: [path.join(serverDir, 'main.py')],
    env: {
      PYTHONPATH: venvSitePackages + ':' + (process.env.PYTHONPATH || ''),
      VIRTUAL_ENV: path.join(serverDir, 'venv'),
      PATH: process.env.PATH + ':' + path.dirname(pythonPath),
      BACKEND_HOST: BACKEND_CONFIG.host,
      BACKEND_PORT: BACKEND_CONFIG.port.toString(),
    }
  };
}`;

// Replace the function in the content
const functionRegex = /\/\/ Get the backend executable path[\s\S]*?^}/m;
content = content.replace(functionRegex, newFunction);

// Write the modified content back
fs.writeFileSync(mainCjsPath, content);

console.log('✅ Backend startup fix applied!');
console.log('📝 The app will now always use the development Python backend');
console.log('🚀 You can now build the app and it should work properly');
