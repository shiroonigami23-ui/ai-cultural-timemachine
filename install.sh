#!/bin/bash

set -e  # Exit on error

echo "🚀 AI Cultural Time Machine - Installation Script"
echo "=================================================="

# Colors for output
RED='[0;31m'
GREEN='[0;32m'
YELLOW='[1;33m'
NC='[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js not found!"
    echo "Installing Node.js via nvm..."

    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

    # Install Node.js 18
    nvm install 18
    nvm use 18
    print_status "Node.js 18 installed"
else
    NODE_VERSION=$(node --version)
    print_status "Node.js $NODE_VERSION detected"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found!"
    exit 1
else
    NPM_VERSION=$(npm --version)
    print_status "npm $NPM_VERSION detected"
fi

# Install dependencies
echo ""
print_status "Installing dependencies..."
npm install

# Check installation
if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create .env.local from example if it doesn't exist
if [ ! -f .env.local ] && [ -f .env.example ]; then
    cp .env.example .env.local
    print_status "Created .env.local from example"
fi

# Verify TypeScript
echo ""
print_status "Verifying TypeScript setup..."
npx tsc --version

# Final instructions
echo ""
echo "="*50
print_status "Installation complete! 🎉"
echo ""
echo "To start the development server:"
echo "  ${YELLOW}npm run dev${NC}"
echo ""
echo "Then open your browser to:"
echo "  ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "For production build:"
echo "  ${YELLOW}npm run build${NC}"
echo "  ${YELLOW}npm start${NC}"
echo ""
echo "Need help? Check DEVELOPMENT.md"
echo "="*50
