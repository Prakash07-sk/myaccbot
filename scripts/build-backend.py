#!/usr/bin/env python3
"""
Build script for MyACCOBot Python backend using PyInstaller
"""

import os
import sys
import subprocess
import shutil
import platform
from pathlib import Path

# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent
SERVER_DIR = PROJECT_ROOT / "Server"
DIST_DIR = PROJECT_ROOT / "dist"
BACKEND_DIST_DIR = SERVER_DIR / "dist"

def get_executable_name():
    """Get platform-specific executable name"""
    system = platform.system().lower()
    machine = platform.machine().lower()
    
    if system == "windows":
        return "myaccobot-backend.exe"
    elif system == "darwin":
        if machine in ["arm64", "aarch64"]:
            return "myaccobot-backend-arm64"
        else:
            return "myaccobot-backend-x64"
    else:  # Linux
        return "myaccobot-backend"

def clean_build():
    """Clean previous builds"""
    print("🧹 Cleaning previous builds...")
    
    dirs_to_clean = [
        BACKEND_DIST_DIR,
        SERVER_DIR / "build",
        SERVER_DIR / "__pycache__",
    ]
    
    for dir_path in dirs_to_clean:
        if dir_path.exists():
            shutil.rmtree(dir_path)
            print(f"   Removed: {dir_path}")

def check_venv():
    """Check if Python virtual environment exists"""
    venv_path = SERVER_DIR / "venv"
    if not venv_path.exists():
        print("❌ Python virtual environment not found!")
        print("   Please run: cd Server && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt")
        sys.exit(1)
    return venv_path

def get_venv_python():
    """Get the Python executable from virtual environment"""
    venv_path = check_venv()
    system = platform.system().lower()
    
    if system == "windows":
        return venv_path / "Scripts" / "python.exe"
    else:
        return venv_path / "bin" / "python"

def install_pyinstaller():
    """Install PyInstaller if not present"""
    print("📦 Checking PyInstaller installation...")
    
    python_exe = get_venv_python()
    
    try:
        # Check if PyInstaller is already installed
        result = subprocess.run(
            [str(python_exe), "-c", "import PyInstaller; print('PyInstaller is installed')"],
            capture_output=True,
            text=True,
            cwd=SERVER_DIR
        )
        
        if result.returncode == 0:
            print("✅ PyInstaller is already installed")
            return
        
        # Install PyInstaller
        print("📦 Installing PyInstaller...")
        subprocess.run(
            [str(python_exe), "-m", "pip", "install", "pyinstaller"],
            check=True,
            cwd=SERVER_DIR
        )
        print("✅ PyInstaller installed successfully")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install PyInstaller: {e}")
        sys.exit(1)

def build_executable():
    """Build the Python executable using PyInstaller"""
    print("🔨 Building Python executable...")
    
    python_exe = get_venv_python()
    
    try:
        subprocess.run(
            [str(python_exe), "-m", "PyInstaller", "main.spec"],
            check=True,
            cwd=SERVER_DIR
        )
        print("✅ Python executable built successfully")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}")
        sys.exit(1)

def copy_executable():
    """Copy executable to dist directory"""
    print("📋 Copying executable to dist directory...")
    
    executable_name = get_executable_name()
    source_path = BACKEND_DIST_DIR / executable_name
    target_dir = DIST_DIR / "backend"
    target_path = target_dir / executable_name
    
    # Create backend directory in dist
    target_dir.mkdir(parents=True, exist_ok=True)
    
    if source_path.exists():
        shutil.copy2(source_path, target_path)
        print(f"✅ Copied {executable_name} to dist/backend/")
        
        # Make executable on Unix systems
        if platform.system().lower() != "windows":
            os.chmod(target_path, 0o755)
    else:
        print(f"❌ Executable not found at {source_path}")
        sys.exit(1)

def main():
    """Main build function"""
    try:
        print("🚀 Starting backend build process...")
        print(f"   Platform: {platform.system()}")
        print(f"   Architecture: {platform.machine()}")
        print(f"   Executable name: {get_executable_name()}")
        
        clean_build()
        install_pyinstaller()
        build_executable()
        copy_executable()
        
        print("🎉 Backend build completed successfully!")
        print(f"   Executable location: {DIST_DIR / 'backend' / get_executable_name()}")
        
    except Exception as e:
        print(f"💥 Backend build failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
