#!/bin/bash

# MyACCOBot Backend Startup Script
# This script ensures the backend starts with the correct Python environment

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_DIR/Server"

echo "🚀 Starting MyACCOBot Backend..."
echo "   Project Directory: $PROJECT_DIR"
echo "   Server Directory: $SERVER_DIR"

# Check if we're in the right directory
if [ ! -f "$SERVER_DIR/main.py" ]; then
    echo "❌ Error: main.py not found in $SERVER_DIR"
    exit 1
fi

# Set up Python environment
export PYTHONPATH="$SERVER_DIR/venv/lib/python3.10/site-packages:$PYTHONPATH"
export VIRTUAL_ENV="$SERVER_DIR/venv"

# Try to find the best Python executable
PYTHON_CMD=""
POSSIBLE_PATHS=(
    "/Users/apple/.pyenv/versions/3.10.13/bin/python3.10"
    "/usr/local/bin/python3"
    "/usr/bin/python3"
    "python3"
)

for path in "${POSSIBLE_PATHS[@]}"; do
    if [ "$path" = "python3" ] || [ -f "$path" ]; then
        PYTHON_CMD="$path"
        break
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    echo "❌ Error: No suitable Python executable found"
    exit 1
fi

echo "🐍 Using Python: $PYTHON_CMD"
echo "📦 PYTHONPATH: $PYTHONPATH"
echo "🔧 VIRTUAL_ENV: $VIRTUAL_ENV"

# Change to server directory and start the backend
cd "$SERVER_DIR"
echo "📁 Working directory: $(pwd)"

echo "🚀 Starting backend server..."
exec "$PYTHON_CMD" main.py
