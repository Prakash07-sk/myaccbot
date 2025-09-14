const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const http = require('http');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object
let mainWindow;
let backendProcess = null;

// Backend configuration
const BACKEND_CONFIG = {
  host: '127.0.0.1',
  port: 8000,
  timeout: 60000, // 60 seconds (increased for slower startup)
};

// Get the backend executable path
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
}

// Start the backend process
function startBackend() {
  if (backendProcess) {
    console.log('Backend process already running');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const backendConfig = getBackendExecutablePath();
    const { command, args, env = {} } = backendConfig;
    
    console.log(`Starting backend: ${command} ${args.join(' ')}`);
    
    // Check if the executable exists (for production builds)
    if (!isDev && !fs.existsSync(command)) {
      console.error(`Backend executable not found at: ${command}`);
      reject(new Error(`Backend executable not found at: ${command}`));
      return;
    }
    
    backendProcess = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ...env,
        BACKEND_HOST: BACKEND_CONFIG.host,
        BACKEND_PORT: BACKEND_CONFIG.port.toString(),
      }
    });

    let backendReady = false;
    let startupTimeout;
    let healthCheckInterval;

    // Function to mark backend as ready
    const markBackendReady = () => {
      if (!backendReady) {
        backendReady = true;
        clearTimeout(startupTimeout);
        if (healthCheckInterval) {
          clearInterval(healthCheckInterval);
        }
        console.log('✅ Backend is ready');
        resolve();
      }
    };

    // Handle backend output
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Backend stdout: ${output}`);
      
      // Check if backend is ready
      if (output.includes('Uvicorn running') || output.includes('Application startup complete') || output.includes('Backend running on:')) {
        markBackendReady();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log(`Backend stderr: ${output}`);
      
      // Check if backend is ready (Uvicorn logs to stderr)
      if (output.includes('Uvicorn running') || output.includes('Application startup complete') || output.includes('Started server process')) {
        markBackendReady();
      }
      
      // Log errors for debugging
      if (output.includes('ERROR') || output.includes('CRITICAL') || output.includes('Traceback')) {
        console.error(`Backend Error: ${output}`);
      }
    });

    // Start health check after a short delay
    setTimeout(async () => {
      if (!backendReady) {
        healthCheckInterval = setInterval(async () => {
          const isHealthy = await checkBackendHealth();
          if (isHealthy) {
            markBackendReady();
          }
        }, 2000); // Check every 2 seconds
      }
    }, 5000); // Start health check after 5 seconds

    backendProcess.on('error', (error) => {
      console.error('Backend process error:', error);
      backendProcess = null;
      reject(error);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log(`Backend process exited with code ${code} and signal ${signal}`);
      backendProcess = null;
      
      if (!backendReady) {
        const errorMsg = `Backend process exited before ready with code ${code}. This usually indicates a missing dependency or configuration issue. Please check the console for more details.`;
        console.error(errorMsg);
        reject(new Error(errorMsg));
      }
    });

    // Set timeout for backend startup
    startupTimeout = setTimeout(() => {
      if (!backendReady) {
        console.error('Backend startup timeout');
        if (healthCheckInterval) {
          clearInterval(healthCheckInterval);
        }
        if (backendProcess) {
          backendProcess.kill();
          backendProcess = null;
        }
        reject(new Error('Backend startup timeout'));
      }
    }, BACKEND_CONFIG.timeout);
  });
}

// Stop the backend process
function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend process...');
    backendProcess.kill('SIGTERM');
    
    // Force kill after 5 seconds if it doesn't stop gracefully
    setTimeout(() => {
      if (backendProcess) {
        console.log('Force killing backend process...');
        backendProcess.kill('SIGKILL');
        backendProcess = null;
      }
    }, 5000);
  }
}

// Check if backend is running
function isBackendRunning() {
  return backendProcess !== null;
}


// Check if backend is responding on the port
function checkBackendHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: BACKEND_CONFIG.host,
      port: BACKEND_CONFIG.port,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false, // Disable web security completely for CORS
      allowRunningInsecureContent: true, // Allow insecure content
      experimentalFeatures: true
    },
    icon: path.join(__dirname, '../dist/public/assets/MyACCOBot_finance-themed_logo_e4c31375-BmOcWdKO.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    // Clear cache in development
    mainWindow.webContents.session.clearCache();
    
    // In development, load from Vite dev server
    const devURL = 'http://localhost:5173/';
    console.log('Loading URL:', devURL);
    console.log('Is dev mode:', isDev);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Add debugging for network requests
    mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
      console.log('Request to:', details.url);
      callback({});
    });
    
    mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
      // Ensure Origin header is set for localhost requests
      if (details.url.includes('localhost:8000')) {
        details.requestHeaders['Origin'] = 'http://localhost:5173';
        details.requestHeaders['Access-Control-Request-Method'] = details.method;
        details.requestHeaders['Access-Control-Request-Headers'] = 'Content-Type';
      }
      console.log('Request headers:', details.requestHeaders);
      callback({ requestHeaders: details.requestHeaders });
    });
    
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      console.log('Response headers for:', details.url);
      console.log('Response headers:', details.responseHeaders);
      
      // Ensure CORS headers are present in response
      if (details.url.includes('localhost:8000')) {
        details.responseHeaders['Access-Control-Allow-Origin'] = ['*'];
        details.responseHeaders['Access-Control-Allow-Methods'] = ['GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH'];
        details.responseHeaders['Access-Control-Allow-Headers'] = ['*'];
        details.responseHeaders['Access-Control-Allow-Credentials'] = ['true'];
        details.responseHeaders['Access-Control-Expose-Headers'] = ['*'];
      }
      
      callback({ responseHeaders: details.responseHeaders });
    });
    
    mainWindow.loadURL(devURL);
    // Open DevTools in development only
    mainWindow.webContents.openDevTools();
    
    // Add debugging for development
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('Failed to load:', errorDescription, 'at', validatedURL);
    });
    
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('Page loaded successfully at:', mainWindow.webContents.getURL());
    });
    
    // Log navigation events
    mainWindow.webContents.on('did-navigate', (event, url) => {
      console.log('Navigated to:', url);
    });
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/public/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on the main window
    if (mainWindow) {
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event listeners
app.whenReady().then(async () => {
  try {
    // Start backend first
    console.log('🚀 Starting MyACCOBot backend...');
    await startBackend();
    
    // Create window after backend is ready
    createWindow();

    // On macOS, re-create window when dock icon is clicked
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    // Set application menu
    createMenu();
    
    // Log registered IPC handlers
    console.log('Electron app ready - IPC handlers registered:');
    console.log('- select-file');
    console.log('- select-folder');
    console.log('- save-file');
    console.log('- minimize-window');
    console.log('- maximize-window');
    console.log('- close-window');
    console.log('- get-app-version');
    console.log('- backend-status');
    
  } catch (error) {
    console.error('Failed to start backend:', error);
    // Show error dialog
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'Backend Startup Error',
      `Failed to start the backend server: ${error.message}\n\nPlease check the console for more details.`
    );
    app.quit();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // Stop backend when all windows are closed
  stopBackend();
  
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app quit
app.on('before-quit', () => {
  console.log('App is quitting, stopping backend...');
  stopBackend();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    // Prevent navigation to external URLs
    if (navigationUrl !== contents.getURL()) {
      navigationEvent.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Conversation',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('new-conversation');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About MyACCOBot',
          click: () => {
            // You can implement an about dialog here
            shell.openExternal('https://github.com/your-username/MyACCOBot');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('select-file', async () => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'XML Files', extensions: ['xml'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('select-folder', async () => {
  console.log('select-folder handler called');
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Folder'
  });
  
  console.log('Dialog result:', result);
  
  if (!result.canceled && result.filePaths.length > 0) {
    console.log('Selected folder path:', result.filePaths[0]);
    return result.filePaths[0]; // Return the full absolute path
  }
  console.log('No folder selected or dialog canceled');
  return null;
});

ipcMain.handle('save-file', async (event, data) => {
  const { dialog } = require('electron');
  const fs = require('fs').promises;
  
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'export.json',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePath) {
    await fs.writeFile(result.filePath, JSON.stringify(data, null, 2));
    return result.filePath;
  }
  return null;
});

// Backend status handler
ipcMain.handle('backend-status', () => {
  return {
    running: isBackendRunning(),
    host: BACKEND_CONFIG.host,
    port: BACKEND_CONFIG.port,
    url: `http://${BACKEND_CONFIG.host}:${BACKEND_CONFIG.port}`
  };
});
