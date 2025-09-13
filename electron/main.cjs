const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object
let mainWindow;

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
app.whenReady().then(() => {
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
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
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
