# MyACCOBot Electron Setup

This document explains how to build and distribute MyACCOBot as a desktop application using Electron.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- For Windows builds: Windows 10/11
- For macOS builds: macOS 10.14 or higher
- For Linux builds: Ubuntu 18.04+ or equivalent

## Project Structure

```
MyACCOBot/
├── electron/
│   ├── main.cjs         # Main Electron process (CommonJS)
│   └── preload.cjs      # Preload script for secure IPC (CommonJS)
├── client/              # React frontend
├── Server/              # Python backend
├── build/               # Build configuration
│   └── entitlements.mac.plist
└── release/             # Built applications (created after build)
```

## Available Scripts

### Development
```bash
# Start development server (React + Python backend)
npm run dev

# Start Electron in development mode
npm run dev:electron

# Test Electron application
npm run electron
```

### Building
```bash
# Build React frontend only
npm run build

# Build Electron app for current platform
npm run build:electron

# Build for specific platforms
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux

# Create distribution packages
npm run dist

# Create unpacked directory (for testing)
npm run pack
```

## Platform-Specific Builds

### Windows
The Windows build creates:
- NSIS installer (`.exe`)
- Portable executable (`.exe`)

```bash
npm run build:win
```

### macOS
The macOS build creates:
- DMG installer
- ZIP archive
- Supports both Intel (x64) and Apple Silicon (arm64)

```bash
npm run build:mac
```

### Linux
The Linux build creates:
- AppImage
- DEB package

```bash
npm run build:linux
```

## Build Output

Built applications are placed in the `release/` directory:
```
release/
├── MyACCOBot-1.0.0.dmg          # macOS installer
├── MyACCOBot-1.0.0.dmg.blockmap # macOS blockmap
├── MyACCOBot-1.0.0.zip          # macOS archive
├── MyACCOBot Setup 1.0.0.exe    # Windows installer
├── MyACCOBot 1.0.0.exe          # Windows portable
└── MyACCOBot-1.0.0.AppImage     # Linux AppImage
```

## Configuration

### Electron Builder Configuration
The build configuration is in `package.json` under the `build` section:

- **App ID**: `com.myaccobot.app`
- **Product Name**: `MyACCOBot`
- **Icons**: Uses the finance-themed logo
- **Categories**: Finance (macOS), Office (Linux)

### Code Signing (macOS)
For distribution on macOS, you'll need:
1. Apple Developer account
2. Code signing certificate
3. Notarization credentials

Update the build configuration in `package.json`:
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)",
      "notarize": {
        "teamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### Code Signing (Windows)
For Windows distribution:
1. Code signing certificate
2. Update the build configuration:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "certificate_password"
    }
  }
}
```

## Security Features

- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer process
- **Remote Module**: Disabled
- **Preload Script**: Secure IPC communication
- **External Links**: Open in default browser

## Development Tips

1. **Hot Reload**: Use `npm run dev:electron` for development with hot reload
2. **Debugging**: DevTools are automatically opened in development mode
3. **Testing**: Use `npm run electron` to test the built application
4. **Logs**: Check console output for debugging information

## Troubleshooting

### Common Issues

1. **Build Fails**: Ensure all dependencies are installed (`npm install`)
2. **App Won't Start**: Check that the React build completed successfully
3. **Icons Missing**: Verify icon files exist in the specified paths
4. **Code Signing Issues**: Check certificate validity and configuration
5. **ES Module Error**: If you see "require is not defined in ES module scope", the Electron files use `.cjs` extension to work with `"type": "module"` in package.json

### Platform-Specific Issues

- **macOS**: May require disabling Gatekeeper for unsigned builds
- **Windows**: Antivirus software may flag unsigned executables
- **Linux**: May need to install additional dependencies for AppImage

## Distribution

### macOS App Store
For App Store distribution, additional configuration is required:
- App Store certificate
- Additional entitlements
- Sandboxing configuration

### Windows Store
For Microsoft Store distribution:
- Windows Store developer account
- Package configuration
- Store-specific signing

## Performance Optimization

- **Bundle Size**: Use `npm run build` to optimize bundle size
- **Memory Usage**: Monitor memory usage in production
- **Startup Time**: Minimize startup dependencies

## Support

For issues related to:
- **Electron**: Check [Electron documentation](https://www.electronjs.org/docs)
- **Electron Builder**: Check [Electron Builder documentation](https://www.electron.build/)
- **This Project**: Create an issue in the project repository
