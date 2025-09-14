# MyACCOBot Build Guide

This guide explains how to build MyACCOBot as a standalone application that includes both the Electron frontend and Python backend in a single package.

## Overview

MyACCOBot uses PyInstaller to package the Python FastAPI backend into a standalone executable, which is then bundled with the Electron frontend using electron-builder. This creates a single application that doesn't require users to have Python installed.

## Prerequisites

### System Requirements
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

### Platform-Specific Requirements
- **Windows**: Visual Studio Build Tools
- **macOS**: Xcode Command Line Tools
- **Linux**: build-essential package

## Project Structure

```
MyACCOBot/
├── Server/                 # Python backend
│   ├── main.py            # FastAPI application
│   ├── main.spec          # PyInstaller configuration
│   ├── requirements.txt   # Python dependencies
│   └── venv/              # Python virtual environment
├── electron/              # Electron main process
│   ├── main.cjs           # Main Electron process
│   └── preload.cjs        # Preload script
├── scripts/               # Build scripts
│   ├── build-backend.js   # Node.js backend build script
│   ├── build-backend.py   # Python backend build script
│   └── build-all.js       # Complete build script
├── dist/                  # Build output
│   ├── public/            # Frontend build
│   └── backend/           # Python executable
└── release/               # Final packaged applications
```

## Build Process

### 1. Development Setup

First, set up the development environment:

```bash
# Install Node.js dependencies
npm install

# Set up Python virtual environment and install dependencies
npm run install:server
```

### 2. Development Mode

For development, you can run the frontend and backend separately:

```bash
# Run frontend and backend in development mode
npm run dev

# Or run Electron in development mode
npm run dev:electron
```

### 3. Building for Production

#### Complete Build (Recommended)

```bash
# Build everything (frontend + backend + Electron app)
npm run build:electron
```

This command will:
1. Build the React frontend
2. Package the Python backend using PyInstaller
3. Bundle everything into an Electron app

#### Step-by-Step Build

If you prefer to build step by step:

```bash
# 1. Build frontend
npm run build

# 2. Build Python backend
npm run build:backend

# 3. Build Electron app
npm run build:electron
```

#### Platform-Specific Builds

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

### 4. Using Build Scripts

The project includes comprehensive build scripts:

```bash
# Complete build using the build script
node scripts/build-all.js

# Build specific components
node scripts/build-all.js frontend
node scripts/build-all.js backend
node scripts/build-all.js electron

# Clean build artifacts
node scripts/build-all.js clean
```

## Backend Packaging Details

### PyInstaller Configuration

The `Server/main.spec` file configures PyInstaller to:

- **Include all dependencies**: FastAPI, Uvicorn, ChromaDB, and other required packages
- **Bundle data files**: Database files and configuration
- **Create windowed executable**: No console window in production
- **Optimize size**: Exclude unnecessary packages like matplotlib, scikit-learn

### Executable Names

The backend executable is named differently for each platform:

- **Windows**: `myaccobot-backend.exe`
- **macOS (Intel)**: `myaccobot-backend-x64`
- **macOS (Apple Silicon)**: `myaccobot-backend-arm64`
- **Linux**: `myaccobot-backend`

### Backend Integration

The Electron main process (`electron/main.cjs`) automatically:

1. **Detects the correct executable** based on platform and architecture
2. **Spawns the backend process** when the app starts
3. **Monitors backend health** and restarts if needed
4. **Gracefully shuts down** the backend when the app closes

## Troubleshooting

### Common Issues

#### 1. Python Virtual Environment Not Found

```bash
# Create virtual environment
cd Server
python -m venv venv

# Activate and install dependencies
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. PyInstaller Build Fails

```bash
# Install PyInstaller
pip install pyinstaller

# Try building with verbose output
pyinstaller --log-level=DEBUG main.spec
```

#### 3. Backend Won't Start

Check the console output for error messages. Common issues:

- **Port already in use**: Change the port in `Server/utils/config.py`
- **Missing dependencies**: Ensure all packages are installed
- **Permission issues**: Make sure the executable has proper permissions

#### 4. Large Bundle Size

The Python backend includes many dependencies. To reduce size:

1. **Remove unused packages** from `requirements.txt`
2. **Add exclusions** in `main.spec`
3. **Use UPX compression** (already enabled)

### Debug Mode

To debug the backend in production:

1. **Enable console output** in `main.spec`:
   ```python
   console=True,  # Change from False to True
   ```

2. **Check logs** in the application's data directory

3. **Use development mode** for debugging:
   ```bash
   npm run dev:electron
   ```

## Build Output

After a successful build, you'll find the packaged applications in the `release/` directory:

- **Windows**: `.exe` installer and portable version
- **macOS**: `.dmg` disk image and `.zip` archive
- **Linux**: `.AppImage` and `.deb` package

## Advanced Configuration

### Custom Backend Configuration

Modify `Server/utils/config.py` to change:

- **Host and port** settings
- **Database paths**
- **Logging configuration**

### Electron Builder Configuration

Edit `package.json` build section to customize:

- **App metadata** (name, version, description)
- **Icons and assets**
- **Code signing** (for distribution)
- **Auto-updater** settings

### PyInstaller Optimization

Edit `Server/main.spec` to:

- **Add/remove hidden imports**
- **Include additional data files**
- **Configure compression options**
- **Set up code signing**

## Distribution

### Code Signing

For distribution, you'll need to set up code signing:

1. **macOS**: Apple Developer certificate
2. **Windows**: Authenticode certificate
3. **Linux**: GPG signing (optional)

### Auto-Updater

The app can be configured for automatic updates using electron-updater. See the electron-builder documentation for setup instructions.

## Performance Considerations

### Backend Startup Time

The Python backend may take a few seconds to start due to:

- **Large dependency loading** (ChromaDB, ML libraries)
- **Database initialization**
- **Model loading**

### Memory Usage

The bundled application uses more memory than a web-based version due to:

- **Python runtime** overhead
- **Bundled dependencies**
- **Electron framework**

### File Size

The final application size is larger due to:

- **Python runtime** (~50-100MB)
- **Dependencies** (~200-500MB)
- **Electron framework** (~100-200MB)

## Support

For build issues or questions:

1. **Check the console output** for error messages
2. **Review the logs** in the application directory
3. **Test in development mode** first
4. **Check platform-specific requirements**

## License

This build process is part of the MyACCOBot project and follows the same license terms.
