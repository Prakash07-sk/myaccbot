#!/bin/bash

# MyACCOBot Build Script
# This script builds the complete MyACCOBot application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js v16 or higher."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python 3.8 or higher."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    npm install
    
    print_status "Setting up Python virtual environment..."
    cd Server
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    pip install -r requirements.txt
    pip install pyinstaller
    
    cd ..
    print_success "Dependencies installed successfully"
}

# Function to clean previous builds
clean_build() {
    print_status "Cleaning previous builds..."
    rm -rf dist
    rm -rf Server/dist
    rm -rf Server/build
    rm -rf Server/__pycache__
    rm -rf release
    print_success "Build artifacts cleaned"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    npm run build
    print_success "Frontend built successfully"
}

# Function to build backend
build_backend() {
    print_status "Building Python backend..."
    
    cd Server
    source venv/bin/activate
    
    # Try Node.js build script first, fallback to Python
    if command_exists node; then
        cd ..
        if npm run build:backend 2>/dev/null; then
            print_success "Backend built with Node.js script"
        else
            print_warning "Node.js build failed, trying Python script..."
            python3 scripts/build-backend.py
        fi
    else
        cd ..
        python3 scripts/build-backend.py
    fi
    
    print_success "Backend built successfully"
}

# Function to build Electron app
build_electron() {
    print_status "Building Electron app..."
    
    # Detect platform
    case "$(uname -s)" in
        Darwin*)
            npm run build:mac
            ;;
        Linux*)
            npm run build:linux
            ;;
        CYGWIN*|MINGW32*|MSYS*|MINGW*)
            npm run build:win
            ;;
        *)
            print_error "Unsupported platform: $(uname -s)"
            exit 1
            ;;
    esac
    
    print_success "Electron app built successfully"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --clean          Clean build artifacts before building"
    echo "  --deps           Install dependencies only"
    echo "  --frontend       Build frontend only"
    echo "  --backend        Build backend only"
    echo "  --electron       Build Electron app only"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Build everything"
    echo "  $0 --clean            # Clean and build everything"
    echo "  $0 --frontend         # Build frontend only"
    echo "  $0 --backend          # Build backend only"
}

# Main function
main() {
    local clean=false
    local deps_only=false
    local frontend_only=false
    local backend_only=false
    local electron_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean)
                clean=true
                shift
                ;;
            --deps)
                deps_only=true
                shift
                ;;
            --frontend)
                frontend_only=true
                shift
                ;;
            --backend)
                backend_only=true
                shift
                ;;
            --electron)
                electron_only=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_status "Starting MyACCOBot build process..."
    print_status "Platform: $(uname -s)"
    print_status "Architecture: $(uname -m)"
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    if [ "$deps_only" = true ]; then
        print_success "Dependencies installed. Exiting."
        exit 0
    fi
    
    # Clean if requested
    if [ "$clean" = true ]; then
        clean_build
    fi
    
    # Build components based on options
    if [ "$frontend_only" = true ]; then
        build_frontend
    elif [ "$backend_only" = true ]; then
        build_backend
    elif [ "$electron_only" = true ]; then
        build_electron
    else
        # Build everything
        build_frontend
        build_backend
        build_electron
    fi
    
    print_success "Build completed successfully!"
    print_status "Check the release/ directory for the built application"
}

# Run main function with all arguments
main "$@"
