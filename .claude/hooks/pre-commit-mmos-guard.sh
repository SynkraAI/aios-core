#!/bin/bash
# MMOS Architecture Guard - Pre-commit Hook
# Version: 1.0
# Purpose: Prevent architectural violations in file placement

set -e

echo "🛡️  Running MMOS Architecture Guard..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

violations=0

# Get staged files
staged_files=$(git diff --cached --name-only --diff-filter=ACM)

# Rule 1: No mind-specific folders in docs/mmos/
echo "Checking Rule 1: No mind-specific folders in docs/mmos/..."

if echo "$staged_files" | grep -qE "docs/mmos/(validations|migrations)/[a-z_-]+"; then
    echo -e "${RED}❌ VIOLATION: Mind-specific folders detected in docs/mmos/${NC}"
    echo ""
    echo "Found:"
    echo "$staged_files" | grep -E "docs/mmos/(validations|migrations)/[a-z_-]+" | sed 's/^/  - /'
    echo ""
    echo -e "${YELLOW}Fix: Move to outputs/minds/{slug}/docs/ instead${NC}"
    echo ""
    echo "Examples:"
    echo "  ❌ docs/mmos/validations/pedro-valerio-checklist.md"
    echo "  ✅ outputs/minds/pedro_valerio/docs/validation-checklist.md"
    echo ""
    violations=$((violations + 1))
fi

# Rule 2: No output files in expansion pack
echo "Checking Rule 2: No output files in expansion pack..."

if echo "$staged_files" | grep -qE "expansion-packs/mmos/(benchmarks|outputs|results)/"; then
    echo -e "${RED}❌ VIOLATION: Output files in expansion pack${NC}"
    echo ""
    echo "Found:"
    echo "$staged_files" | grep -E "expansion-packs/mmos/(benchmarks|outputs|results)/" | sed 's/^/  - /'
    echo ""
    echo -e "${YELLOW}Fix: Move to docs/mmos/qa/benchmarks/ or appropriate output location${NC}"
    echo ""
    violations=$((violations + 1))
fi

# Rule 3: Check for common naming violations
echo "Checking Rule 3: Mind-specific files should be in outputs/minds/..."

# Check for files with mind names in docs/mmos/ (excluding allowed folders)
for mind_name in $(ls outputs/minds/ 2>/dev/null | grep -v "^README" || true); do
    if echo "$staged_files" | grep -qE "docs/mmos/.*${mind_name}"; then
        # Exclude allowed locations (reports can mention minds)
        if ! echo "$staged_files" | grep -qE "docs/mmos/(reports|architecture)/"; then
            echo -e "${YELLOW}⚠️  WARNING: File containing mind name '$mind_name' in docs/mmos/${NC}"
            echo "$staged_files" | grep -E "docs/mmos/.*${mind_name}" | sed 's/^/  - /'
            echo ""
            echo "Verify this is system-level documentation, not mind-specific"
            echo ""
        fi
    fi
done

# Rule 4: Verify outputs/minds/{slug}/ structure
echo "Checking Rule 4: outputs/minds/{slug}/ structure..."

if echo "$staged_files" | grep -qE "outputs/minds/[^/]+/[^/]+\.(md|yaml|json)$"; then
    echo -e "${YELLOW}⚠️  WARNING: Files in outputs/minds/{slug}/ root detected${NC}"
    echo ""
    echo "Found:"
    echo "$staged_files" | grep -E "outputs/minds/[^/]+/[^/]+\.(md|yaml|json)$" | sed 's/^/  - /'
    echo ""
    echo "Pipeline outputs should be in subfolders:"
    echo "  - analysis/, synthesis/, implementation/, system_prompts/, kb/"
    echo "  - Process docs should be in docs/"
    echo "  - Logs should be in logs/"
    echo ""
fi

# Final verdict
echo ""
if [ $violations -gt 0 ]; then
    echo -e "${RED}❌ COMMIT REJECTED: $violations architectural violation(s) found${NC}"
    echo ""
    echo "Review:"
    echo "  - docs/mmos/ARCHITECTURE_RULES.md"
    echo "  - .aios-core/checklists/mmos-architecture-guard.md"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ Architecture guard passed${NC}"
    exit 0
fi
