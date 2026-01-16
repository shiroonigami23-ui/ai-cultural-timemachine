#!/bin/bash

# Supabase migration helper script

echo "🔧 Supabase Migration Helper"
echo "============================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install supabase/tap/supabase
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux installation
        curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        sudo npm install -g supabase --unsafe-perm
    else
        echo "Please install Supabase CLI manually: https://supabase.com/docs/guides/cli"
        exit 1
    fi
fi

echo ""
echo "Available commands:"
echo "1. Start local Supabase: ./supabase.sh start"
echo "2. Stop local Supabase: ./supabase.sh stop"
echo "3. Reset database: ./supabase.sh reset"
echo "4. Apply migrations: ./supabase.sh migrate"
echo "5. Generate types: ./supabase.sh types"
echo ""

case "$1" in
    "start")
        echo "Starting local Supabase..."
        supabase start
        ;;
    "stop")
        echo "Stopping local Supabase..."
        supabase stop
        ;;
    "reset")
        echo "Resetting database..."
        supabase db reset
        ;;
    "migrate")
        echo "Applying migrations..."
        supabase db push
        ;;
    "types")
        echo "Generating TypeScript types..."
        supabase gen types typescript --local > src/lib/supabase/database.types.ts
        echo "Types generated at src/lib/supabase/database.types.ts"
        ;;
    *)
        echo "Usage: $0 {start|stop|reset|migrate|types}"
        exit 1
        ;;
esac