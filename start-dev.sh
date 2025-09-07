#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo
    echo -e "${BOLD}${MAGENTA}========================================"
    echo -e "   WatchHere Development Environment"
    echo -e "========================================${NC}"
    echo
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
is_port_in_use() {
    if command_exists lsof; then
        lsof -i :$1 >/dev/null 2>&1
    elif command_exists netstat; then
        netstat -ln | grep ":$1 " >/dev/null 2>&1
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=1
    
    print_status "⏳ Waiting for $service to be ready..." "$YELLOW"
    
    while [ $attempt -le $max_attempts ]; do
        if is_port_in_use $port; then
            print_status "✅ $service is ready" "$GREEN"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_status "⚠️ $service may not be fully ready" "$YELLOW"
    return 1
}

# Function to start MongoDB
start_mongodb() {
    print_status "🔄 Checking MongoDB..." "$YELLOW"
    
    # Check if MongoDB is already running
    if is_port_in_use 27017; then
        print_status "✅ MongoDB is already running" "$GREEN"
        return 0
    fi
    
    print_status "🚀 Starting MongoDB..." "$BLUE"
    
    # Try to start MongoDB service (Linux/macOS)
    if command_exists systemctl; then
        # Linux with systemd
        if sudo systemctl start mongod >/dev/null 2>&1; then
            print_status "✅ MongoDB service started" "$GREEN"
            wait_for_service 27017 "MongoDB"
            return 0
        fi
    elif command_exists brew; then
        # macOS with Homebrew
        if brew services start mongodb-community >/dev/null 2>&1; then
            print_status "✅ MongoDB service started via Homebrew" "$GREEN"
            wait_for_service 27017 "MongoDB"
            return 0
        fi
    fi
    
    # Try Docker
    if command_exists docker; then
        print_status "🐳 Starting MongoDB via Docker..." "$BLUE"
        
        # Check if container exists
        if docker ps -a --filter name=watchhere-mongo --format "{{.Names}}" | grep -q watchhere-mongo; then
            docker start watchhere-mongo >/dev/null 2>&1
            print_status "✅ MongoDB Docker container started" "$GREEN"
        else
            docker run -d --name watchhere-mongo -p 27017:27017 -v watchhere-mongo-data:/data/db mongo:latest >/dev/null 2>&1
            print_status "✅ MongoDB Docker container created and started" "$GREEN"
        fi
        
        wait_for_service 27017 "MongoDB"
        return 0
    fi
    
    print_status "❌ Could not start MongoDB. Please install MongoDB or Docker" "$RED"
    return 1
}

# Function to start Redis
start_redis() {
    print_status "🔄 Checking Redis..." "$YELLOW"
    
    # Check if Redis is already running
    if is_port_in_use 6379; then
        print_status "✅ Redis is already running" "$GREEN"
        return 0
    fi
    
    print_status "🚀 Starting Redis..." "$BLUE"
    
    # Try to start Redis service
    if command_exists systemctl; then
        # Linux with systemd
        if sudo systemctl start redis >/dev/null 2>&1; then
            print_status "✅ Redis service started" "$GREEN"
            wait_for_service 6379 "Redis"
            return 0
        fi
    elif command_exists brew; then
        # macOS with Homebrew
        if brew services start redis >/dev/null 2>&1; then
            print_status "✅ Redis service started via Homebrew" "$GREEN"
            wait_for_service 6379 "Redis"
            return 0
        fi
    fi
    
    # Try Docker
    if command_exists docker; then
        print_status "🐳 Starting Redis via Docker..." "$BLUE"
        
        # Check if container exists
        if docker ps -a --filter name=watchhere-redis --format "{{.Names}}" | grep -q watchhere-redis; then
            docker start watchhere-redis >/dev/null 2>&1
            print_status "✅ Redis Docker container started" "$GREEN"
        else
            docker run -d --name watchhere-redis -p 6379:6379 redis:alpine redis-server --appendonly yes >/dev/null 2>&1
            print_status "✅ Redis Docker container created and started" "$GREEN"
        fi
        
        wait_for_service 6379 "Redis"
        return 0
    fi
    
    print_status "⚠️ Could not start Redis (optional service)" "$YELLOW"
    return 1
}

# Function to start backend
start_backend() {
    print_status "🔄 Starting WatchHere Backend..." "$YELLOW"
    
    # Check if backend directory exists
    if [ ! -d "backend" ]; then
        print_status "❌ Backend directory not found" "$RED"
        return 1
    fi
    
    # Check if server.js exists
    if [ ! -f "backend/server.js" ]; then
        print_status "❌ server.js not found in backend directory" "$RED"
        return 1
    fi
    
    cd backend
    
    print_status "🚀 Starting Node.js server..." "$BLUE"
    echo
    print_status "========================================" "$GREEN"
    print_status "  WatchHere Backend Starting..." "$GREEN"
    print_status "========================================" "$GREEN"
    echo
    print_status "💡 Press Ctrl+C to stop all services" "$YELLOW"
    echo
    
    # Start the server
    node server.js
}

# Function for graceful shutdown
cleanup() {
    echo
    print_status "🛑 Shutting down development environment..." "$YELLOW"
    
    # Stop Docker containers if they exist
    if command_exists docker; then
        docker stop watchhere-mongo watchhere-redis >/dev/null 2>&1
        print_status "📴 Docker containers stopped" "$GREEN"
    fi
    
    print_status "👋 Goodbye!" "$GREEN"
    exit 0
}

# Main function
main() {
    # Set up signal handlers
    trap cleanup SIGINT SIGTERM
    
    print_header
    
    # Check prerequisites
    if ! command_exists node; then
        print_status "❌ Node.js not found. Please install Node.js" "$RED"
        exit 1
    fi
    
    # Start services
    start_mongodb
    if [ $? -ne 0 ]; then
        print_status "❌ Cannot continue without MongoDB" "$RED"
        exit 1
    fi
    
    start_redis  # Redis is optional, so we don't exit on failure
    
    # Start backend
    start_backend
}

# Run main function
main "$@"