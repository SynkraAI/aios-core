#!/bin/bash
# Download materials-only for specified courses

# Activate virtual environment
source .venv/bin/activate

# Output directory
OUTPUT_BASE="/Users/luizfosc/Dropbox/Downloads/Cursos"

# Courses to download (subdomain:name pairs)
declare -A COURSES=(
    ["blackfridayinfinita"]="Leandro Ladeira Courses"
    ["maquina-7d"]="Pitch de 100 Milhões"
    ["3funishighticket"]="Os 3 Funis High Ticket"
)

# Function to download materials for a course
download_materials() {
    local subdomain=$1
    local course_name=$2

    echo ""
    echo "=========================================="
    echo "Downloading materials: $course_name"
    echo "Subdomain: $subdomain"
    echo "=========================================="

    # Download materials only (no videos)
    hotmart-dl download \
        -c "$subdomain" \
        --materials-only \
        --debug

    if [ $? -eq 0 ]; then
        echo "✓ Success: $course_name"
    else
        echo "✗ Failed: $course_name"
    fi
}

# Download each course
for subdomain in "${!COURSES[@]}"; do
    download_materials "$subdomain" "${COURSES[$subdomain]}"
done

echo ""
echo "=========================================="
echo "Download complete!"
echo "=========================================="
