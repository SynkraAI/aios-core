#!/bin/bash
# Setup .pgpass for secure PostgreSQL authentication
# Migrates from SUPABASE_DB_URL to secure .pgpass file

set -euo pipefail

# Import common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh" 2>/dev/null || true

print_header "Secure Credential Setup" "1.0"

# Function to parse PostgreSQL URL
parse_postgres_url() {
    local url="$1"

    # Extract components from postgresql://user:password@host:port/database
    if [[ "$url" =~ postgresql://([^:]+)\.([^:]+):([^@]+)@([^:]+):([0-9]+)/([^?]+) ]]; then
        export PG_USER="${BASH_REMATCH[1]}.${BASH_REMATCH[2]}"
        export PG_PASSWORD="${BASH_REMATCH[3]}"
        export PG_HOST="${BASH_REMATCH[4]}"
        export PG_PORT="${BASH_REMATCH[5]}"
        export PG_DATABASE="${BASH_REMATCH[6]}"
        return 0
    else
        log_error "Could not parse PostgreSQL URL format"
        return 1
    fi
}

# Function to URL decode password
url_decode() {
    local url_encoded="${1//+/ }"
    printf '%b' "${url_encoded//%/\\x}"
}

log_info "Setting up secure database credentials..."

# Check if .pgpass already exists
if [ -f ~/.pgpass ]; then
    log_warning ".pgpass file already exists"
    confirm "Do you want to overwrite it?"
fi

# Try to get credentials from environment or .env file
if [ -n "${SUPABASE_DB_URL:-}" ]; then
    log_info "Using SUPABASE_DB_URL from environment"
    DB_URL="$SUPABASE_DB_URL"
elif [ -f .env ]; then
    log_info "Looking for SUPABASE_DB_URL in .env file"
    # Source .env file safely (only SUPABASE_DB_URL)
    DB_URL=$(grep "^SUPABASE_DB_URL=" .env | cut -d= -f2- | tr -d '"' | tr -d "'")

    if [ -z "$DB_URL" ] || [[ "$DB_URL" == *"[project-ref]"* ]]; then
        log_error ".env file exists but SUPABASE_DB_URL is not configured"
        echo ""
        echo "Please configure your database URL:"
        echo "1. Go to https://supabase.com/dashboard"
        echo "2. Select your project"
        echo "3. Click 'Connect' → 'Connection pooler'"
        echo "4. Copy the PostgreSQL connection string"
        echo "5. Update .env with your connection string"
        echo ""
        echo "Or set SUPABASE_DB_URL environment variable and run this script again"
        exit 1
    fi
else
    log_error "No database configuration found"
    echo ""
    echo "Please either:"
    echo "1. Set SUPABASE_DB_URL environment variable"
    echo "2. Create .env file from .env.example and configure SUPABASE_DB_URL"
    exit 1
fi

# Parse the URL
log_info "Parsing database URL..."
if ! parse_postgres_url "$DB_URL"; then
    log_error "Failed to parse database URL"
    exit 1
fi

# Decode password (it might be URL-encoded)
PG_PASSWORD=$(url_decode "$PG_PASSWORD")

# Create .pgpass file
log_info "Creating .pgpass file..."
cat > ~/.pgpass << EOF
# Supabase Database Connection
# Format: hostname:port:database:username:password
$PG_HOST:$PG_PORT:$PG_DATABASE:$PG_USER:$PG_PASSWORD

# Wildcard entry for all databases on this host
$PG_HOST:$PG_PORT:*:$PG_USER:$PG_PASSWORD
EOF

# Set secure permissions (required by PostgreSQL)
chmod 600 ~/.pgpass
log_success ".pgpass file created with secure permissions (600)"

# Create environment export file for scripts
ENV_FILE="$SCRIPT_DIR/../.pgenv"
cat > "$ENV_FILE" << EOF
# PostgreSQL Environment Variables
# Source this file in scripts: source "\$(dirname "\$0")/../.pgenv"
export PGHOST="$PG_HOST"
export PGPORT="$PG_PORT"
export PGDATABASE="$PG_DATABASE"
export PGUSER="$PG_USER"
# Password is in .pgpass, not exported

# Convenience alias for psql
alias dbcli="psql"
EOF

log_success "Environment file created at $ENV_FILE"

# Test the connection
log_info "Testing database connection..."
export PGHOST="$PG_HOST"
export PGPORT="$PG_PORT"
export PGDATABASE="$PG_DATABASE"
export PGUSER="$PG_USER"

if psql -c "SELECT 1" > /dev/null 2>&1; then
    log_success "Database connection successful!"
else
    log_error "Database connection failed"
    echo ""
    echo "Please check:"
    echo "1. Database credentials are correct"
    echo "2. Database is accessible from your network"
    echo "3. Supabase project is active"
    exit 1
fi

# Create example script showing new usage
EXAMPLE_FILE="$SCRIPT_DIR/example-secure-connection.sh"
cat > "$EXAMPLE_FILE" << 'EOF'
#!/bin/bash
# Example: Using secure database connection

# Source the environment (sets PGHOST, PGPORT, PGDATABASE, PGUSER)
source "$(dirname "$0")/../.pgenv"

# Now psql uses .pgpass automatically (no password in command)
psql -c "SELECT current_database(), current_user, version();"

# Or use in scripts
psql << SQL
    SELECT count(*) as table_count
    FROM information_schema.tables
    WHERE table_schema = 'public';
SQL
EOF

chmod +x "$EXAMPLE_FILE"
log_success "Example script created at $EXAMPLE_FILE"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ SECURE CREDENTIAL SETUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "What was done:"
echo "  1. Created ~/.pgpass with database credentials"
echo "  2. Set secure permissions (600) on .pgpass"
echo "  3. Created .pgenv file for scripts to source"
echo "  4. Tested database connection successfully"
echo ""
echo "How to use in scripts:"
echo '  source "$(dirname "$0")/../.pgenv"'
echo '  psql -c "SELECT 1"  # No password needed!'
echo ""
echo "Security benefits:"
echo "  • No passwords in environment variables"
echo "  • No passwords visible in process list"
echo "  • No passwords in shell history"
echo "  • PostgreSQL native security"
echo ""
echo "Next steps:"
echo "  1. Update existing scripts to use .pgenv"
echo "  2. Remove SUPABASE_DB_URL from scripts"
echo "  3. Test scripts with new authentication"
echo "═══════════════════════════════════════════════════════════"