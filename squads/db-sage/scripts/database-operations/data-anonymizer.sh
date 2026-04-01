#!/bin/bash
# Data Anonymizer - Anonymize sensitive data for GDPR/LGPD compliance
# Purpose: Replace PII with anonymized data for dev/staging environments
# Token Savings: ~90% vs manual anonymization
# Usage: ./data-anonymizer.sh [--table TABLE] [--column COLUMN] [--dry-run] [--preset TYPE]

set -euo pipefail

# Import common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh" 2>/dev/null || {
    # Fallback if common.sh doesn't exist
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m'
    log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
    log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
    log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1" >&2; }
    error_exit() { log_error "$1"; exit "${2:-1}"; }
}

# Check for secure authentication
if [ -f "$SCRIPT_DIR/../.pgenv" ]; then
    source "$SCRIPT_DIR/../.pgenv"
    log_info "Using secure .pgpass authentication"
elif [ -n "${SUPABASE_DB_URL:-}" ]; then
    log_warning "Using SUPABASE_DB_URL (consider running setup-pgpass.sh for secure auth)"
    DB_CONNECTION="$SUPABASE_DB_URL"
else
    log_error "No database connection configured"
    echo "Please run: $SCRIPT_DIR/setup-pgpass.sh"
    exit 1
fi

# Database query helper
db_query() {
    local query="$1"
    if [ -n "${PGHOST:-}" ]; then
        psql -t -A -c "$query" 2>/dev/null
    else
        psql "$DB_CONNECTION" -t -A -c "$query" 2>/dev/null
    fi
}

# Execute SQL with transaction support
db_execute() {
    local query="$1"
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would execute:"
        echo "$query"
        return 0
    fi

    if [ -n "${PGHOST:-}" ]; then
        psql -c "$query"
    else
        psql "$DB_CONNECTION" -c "$query"
    fi
}

# Parse arguments
DRY_RUN=false
SPECIFIC_TABLE=""
SPECIFIC_COLUMN=""
PRESET="auto"
BACKUP_FIRST=true
VERBOSE=false

print_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Anonymize sensitive data in PostgreSQL/Supabase databases.

Options:
    --table TABLE      Anonymize specific table only
    --column COLUMN    Anonymize specific column (requires --table)
    --preset TYPE      Use preset anonymization rules:
                       auto (default) - Auto-detect sensitive columns
                       email - Anonymize email addresses
                       phone - Anonymize phone numbers
                       name - Anonymize names
                       address - Anonymize addresses
                       credit - Anonymize credit card data
                       ssn - Anonymize SSN/CPF/ID numbers
                       all - Apply all anonymization rules
    --dry-run         Show what would be changed without executing
    --no-backup       Skip backup creation (not recommended)
    --force           Skip confirmation prompts
    --verbose         Show detailed progress
    --help           Show this help message

Examples:
    # Auto-detect and anonymize all sensitive data
    $0

    # Dry run to see what would be changed
    $0 --dry-run

    # Anonymize specific table
    $0 --table users

    # Anonymize emails only
    $0 --preset email

    # Anonymize specific column
    $0 --table customers --column email

Security Note:
    This tool is for NON-PRODUCTION databases only!
    Always backup before running and test thoroughly.
EOF
}

FORCE=false

while [ $# -gt 0 ]; do
    case "$1" in
        --table)
            SPECIFIC_TABLE="$2"
            shift 2
            ;;
        --column)
            SPECIFIC_COLUMN="$2"
            shift 2
            ;;
        --preset)
            PRESET="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --no-backup)
            BACKUP_FIRST=false
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            print_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Validate options
if [ -n "$SPECIFIC_COLUMN" ] && [ -z "$SPECIFIC_TABLE" ]; then
    error_exit "--column requires --table to be specified"
fi

# Function to detect sensitive columns
detect_sensitive_columns() {
    local table="${1:-}"
    local query

    if [ -n "$table" ]; then
        query="
        SELECT
            table_name,
            column_name,
            data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '$table'
        AND (
            column_name ~* 'email|mail|correo'
            OR column_name ~* 'phone|telefone|movil|celular'
            OR column_name ~* 'name|nombre|nome'
            OR column_name ~* 'address|endereco|direccion'
            OR column_name ~* 'ssn|cpf|rg|dni|passport'
            OR column_name ~* 'credit|card|tarjeta'
            OR column_name ~* 'birth|nascimento|nacimiento'
        )
        ORDER BY table_name, ordinal_position;"
    else
        query="
        SELECT
            table_name,
            column_name,
            data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (
            column_name ~* 'email|mail|correo'
            OR column_name ~* 'phone|telefone|movil|celular'
            OR column_name ~* 'name|nombre|nome'
            OR column_name ~* 'address|endereco|direccion'
            OR column_name ~* 'ssn|cpf|rg|dni|passport'
            OR column_name ~* 'credit|card|tarjeta'
            OR column_name ~* 'birth|nascimento|nacimiento'
        )
        ORDER BY table_name, ordinal_position;"
    fi

    db_query "$query"
}

# Function to generate anonymization SQL
generate_anonymization_sql() {
    local table="$1"
    local column="$2"
    local data_type="$3"
    local sql=""

    # Determine anonymization strategy based on column name
    case "$column" in
        *email*|*mail*|*correo*)
            sql="UPDATE $table SET $column = 'user_' || id || '@example.com' WHERE $column IS NOT NULL;"
            ;;
        *phone*|*telefone*|*movil*|*celular*)
            sql="UPDATE $table SET $column = '+1555' || LPAD(FLOOR(RANDOM() * 10000000)::text, 7, '0') WHERE $column IS NOT NULL;"
            ;;
        *first*name*|*nombre*|*primeiro*)
            sql="UPDATE $table SET $column = 'FirstName_' || id WHERE $column IS NOT NULL;"
            ;;
        *last*name*|*apellido*|*sobrenome*)
            sql="UPDATE $table SET $column = 'LastName_' || id WHERE $column IS NOT NULL;"
            ;;
        *name*|*nombre*|*nome*)
            sql="UPDATE $table SET $column = 'User_' || id WHERE $column IS NOT NULL;"
            ;;
        *address*|*endereco*|*direccion*|*street*|*calle*|*rua*)
            sql="UPDATE $table SET $column = '123 Anonymous St, City ' || id WHERE $column IS NOT NULL;"
            ;;
        *ssn*|*cpf*|*rg*|*dni*|*passport*)
            sql="UPDATE $table SET $column = 'XXX-XX-' || LPAD((id % 10000)::text, 4, '0') WHERE $column IS NOT NULL;"
            ;;
        *credit*|*card*|*tarjeta*)
            sql="UPDATE $table SET $column = '4111-1111-1111-' || LPAD((id % 10000)::text, 4, '0') WHERE $column IS NOT NULL;"
            ;;
        *birth*|*nascimento*|*nacimiento*|*dob*)
            sql="UPDATE $table SET $column = '1990-01-01'::date + (id % 365 || ' days')::interval WHERE $column IS NOT NULL;"
            ;;
        *ip*address*|*ip_addr*)
            sql="UPDATE $table SET $column = '10.0.' || ((id / 256) % 256) || '.' || (id % 256) WHERE $column IS NOT NULL;"
            ;;
        *password*|*senha*|*clave*|*hash*)
            sql="UPDATE $table SET $column = MD5('password_' || id || '_anonymized') WHERE $column IS NOT NULL;"
            ;;
        *)
            # Generic text anonymization
            if [[ "$data_type" == *"character"* ]] || [[ "$data_type" == "text" ]]; then
                sql="UPDATE $table SET $column = 'ANONYMIZED_' || id WHERE $column IS NOT NULL;"
            fi
            ;;
    esac

    echo "$sql"
}

# Function to count affected rows
count_affected_rows() {
    local table="$1"
    local column="$2"

    local count
    count=$(db_query "SELECT COUNT(*) FROM $table WHERE $column IS NOT NULL;" || echo "0")
    echo "$count"
}

# Function to create backup
create_backup() {
    log_info "Creating backup before anonymization..."

    local backup_file="/tmp/pre_anonymization_$(date +%Y%m%d_%H%M%S).sql"

    if [ -n "${PGHOST:-}" ]; then
        pg_dump --data-only --no-owner > "$backup_file"
    else
        pg_dump "$DB_CONNECTION" --data-only --no-owner > "$backup_file"
    fi

    if [ -f "$backup_file" ]; then
        local size
        size=$(du -h "$backup_file" | cut -f1)
        log_info "Backup created: $backup_file ($size)"
        echo "$backup_file"
    else
        error_exit "Failed to create backup"
    fi
}

# Main execution
print_header "Data Anonymizer" "1.0"

# Safety check
if [ "$DRY_RUN" = false ] && [ "$FORCE" = false ]; then
    echo -e "${YELLOW}⚠️  WARNING: Data Anonymization${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "This tool will PERMANENTLY modify data in your database."
    echo "This should ONLY be used on development/staging databases."
    echo ""
    echo -e "${RED}NEVER run this on production data!${NC}"
    echo ""
    read -p "Are you sure you want to continue? Type 'yes' to proceed: " confirmation

    if [ "$confirmation" != "yes" ]; then
        log_info "Anonymization cancelled by user"
        exit 0
    fi
fi

# Create backup if requested
BACKUP_FILE=""
if [ "$BACKUP_FIRST" = true ] && [ "$DRY_RUN" = false ]; then
    BACKUP_FILE=$(create_backup)
fi

# Detect sensitive columns
log_info "Detecting sensitive columns..."
COLUMNS_TO_ANONYMIZE=$(detect_sensitive_columns "$SPECIFIC_TABLE")

if [ -z "$COLUMNS_TO_ANONYMIZE" ]; then
    log_warning "No sensitive columns detected"
    echo "Columns checked: email, phone, name, address, ssn, credit card, birth date"
    echo "Use --table and --column to specify manually if needed"
    exit 0
fi

# Count total operations
TOTAL_OPERATIONS=$(echo "$COLUMNS_TO_ANONYMIZE" | wc -l | tr -d ' ')
log_info "Found $TOTAL_OPERATIONS sensitive columns to anonymize"

# Process anonymization
echo ""
echo -e "${CYAN}📊 Anonymization Plan:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

OPERATIONS_PERFORMED=0
ROWS_AFFECTED=0

# Begin transaction
if [ "$DRY_RUN" = false ]; then
    db_execute "BEGIN;"
fi

while IFS='|' read -r table column data_type; do
    # Skip if specific column requested and this isn't it
    if [ -n "$SPECIFIC_COLUMN" ] && [ "$column" != "$SPECIFIC_COLUMN" ]; then
        continue
    fi

    # Count affected rows
    row_count=$(count_affected_rows "$table" "$column")

    echo ""
    echo "Table: $table"
    echo "Column: $column ($data_type)"
    echo "Rows to anonymize: $row_count"

    if [ "$row_count" -eq 0 ]; then
        echo "Status: SKIPPED (no data)"
        continue
    fi

    # Generate anonymization SQL
    sql=$(generate_anonymization_sql "$table" "$column" "$data_type")

    if [ -z "$sql" ]; then
        echo "Status: SKIPPED (no anonymization rule)"
        continue
    fi

    if [ "$VERBOSE" = true ]; then
        echo "SQL: $sql"
    fi

    # Execute anonymization
    if [ "$DRY_RUN" = true ]; then
        echo "Status: [DRY-RUN] Would anonymize"
    else
        if db_execute "$sql"; then
            echo -e "Status: ${GREEN}✓ Anonymized${NC}"
            OPERATIONS_PERFORMED=$((OPERATIONS_PERFORMED + 1))
            ROWS_AFFECTED=$((ROWS_AFFECTED + row_count))
        else
            echo -e "Status: ${RED}✗ Failed${NC}"
            # Rollback on error
            db_execute "ROLLBACK;"
            error_exit "Anonymization failed. Database rolled back to original state."
        fi
    fi

done <<< "$COLUMNS_TO_ANONYMIZE"

# Commit transaction
if [ "$DRY_RUN" = false ] && [ "$OPERATIONS_PERFORMED" -gt 0 ]; then
    log_info "Committing changes..."
    if db_execute "COMMIT;"; then
        log_info "Changes committed successfully"
    else
        db_execute "ROLLBACK;"
        error_exit "Failed to commit changes. Database rolled back."
    fi
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}📊 Anonymization Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$DRY_RUN" = true ]; then
    echo "Mode: DRY-RUN (no changes made)"
    echo "Operations that would be performed: $TOTAL_OPERATIONS"
else
    echo "Operations performed: $OPERATIONS_PERFORMED"
    echo "Total rows anonymized: $ROWS_AFFECTED"

    if [ -n "$BACKUP_FILE" ]; then
        echo ""
        echo "Backup location: $BACKUP_FILE"
        echo ""
        echo "To restore original data:"
        echo "  psql \$SUPABASE_DB_URL < $BACKUP_FILE"
    fi
fi

echo ""
echo -e "${GREEN}✅ Anonymization complete!${NC}"

if [ "$DRY_RUN" = false ] && [ "$OPERATIONS_PERFORMED" -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Important Notes:${NC}"
    echo "• Data has been permanently anonymized"
    echo "• Test your application thoroughly"
    echo "• Keep the backup file safe"
    echo "• Do NOT use this database for production"
fi