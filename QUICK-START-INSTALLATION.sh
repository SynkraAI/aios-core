#!/bin/bash
# Quick Start Installation Script for Copywriting/Marketing Squad
# Generated: 2026-02-13
# Usage: bash QUICK-START-INSTALLATION.sh [tier]
# Tiers: foundation, power, platform, all

set -e  # Exit on error

echo "=================================================="
echo "AIOS Copywriting/Marketing Squad - Quick Install"
echo "=================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install Node.js first."
        exit 1
    fi
    print_success "npm found: $(npm --version)"
}

# Check if python/pip is installed
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "python3 not found. Please install Python first."
        exit 1
    fi
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 not found. Please install pip first."
        exit 1
    fi
    print_success "Python found: $(python3 --version)"
    print_success "pip found: $(pip3 --version)"
}

# TIER 1: Foundation Tools
install_foundation() {
    echo ""
    print_status "=========================================="
    print_status "TIER 1: Installing Foundation Tools"
    print_status "=========================================="
    echo ""

    print_status "Installing npm packages..."
    npm install -g seo-analyzer
    npm install cheerio
    npm install keyword-extractor
    print_success "npm packages installed"

    print_status "Installing Python packages..."
    pip3 install textstat
    print_success "Python packages installed"

    print_success "Foundation tier complete! ✓"
    echo ""
    print_status "Available commands:"
    echo "  - seo-analyzer <url>         # Analyze SEO"
    echo "  - Python: import textstat    # Readability scoring"
    echo "  - Node.js: require('cheerio') # Web scraping"
}

# TIER 2: Power Tools
install_power() {
    echo ""
    print_status "=========================================="
    print_status "TIER 2: Installing Power Tools"
    print_status "=========================================="
    echo ""

    print_status "Installing npm packages..."
    npm install puppeteer
    npm install playwright
    npm install compromise
    print_success "npm packages installed"

    print_status "Installing Python packages..."
    pip3 install spacy
    pip3 install scrapy
    pip3 install beautifulsoup4
    pip3 install textblob
    pip3 install nltk
    print_success "Python packages installed"

    print_status "Downloading spaCy models (this may take a few minutes)..."
    python3 -m spacy download en_core_web_sm
    print_success "spaCy models downloaded"

    print_success "Power tier complete! ✓"
    echo ""
    print_status "Available tools:"
    echo "  - Python: import spacy         # Industrial NLP"
    echo "  - Python: import scrapy        # Web scraping framework"
    echo "  - Node.js: require('puppeteer') # Headless browser"
}

# TIER 3: Platform Tools
install_platform() {
    echo ""
    print_status "=========================================="
    print_status "TIER 3: Installing Platform Tools"
    print_status "=========================================="
    echo ""

    print_warning "Platform tier requires additional setup:"
    echo ""
    echo "1. ALwrity (AI Marketing Platform)"
    echo "   git clone https://github.com/AJaySi/ALwrity"
    echo "   cd ALwrity && pip3 install -r requirements.txt"
    echo ""
    echo "2. Mautic (Marketing Automation)"
    echo "   docker-compose up -d"
    echo "   Visit: http://localhost:8080"
    echo ""
    echo "3. RankCraft AI"
    echo "   git clone https://github.com/steve2700/rankcraft-ai"
    echo "   cd rankcraft-ai && pip3 install -r requirements.txt"
    echo ""
    print_warning "These require manual installation due to configuration needs."
}

# Additional SEO CLI tools
install_seo_cli() {
    echo ""
    print_status "Installing additional SEO CLI tools..."
    npm install -g readability-checker
    npm install seolint
    npm install seo-checker
    print_success "SEO CLI tools installed"
}

# Advanced NLP tools
install_advanced_nlp() {
    echo ""
    print_status "Installing advanced NLP tools..."
    pip3 install newspaper3k
    pip3 install py-readability-metrics
    npm install @rumenx/seo
    npm install text-readability-ts
    npm install @mozilla/readability
    npm install retext-keywords
    print_success "Advanced NLP tools installed"
}

# Show usage
show_usage() {
    echo "Usage: bash QUICK-START-INSTALLATION.sh [tier]"
    echo ""
    echo "Available tiers:"
    echo "  foundation  - Essential tools (seo-analyzer, textstat, cheerio)"
    echo "  power       - Advanced tools (spaCy, Scrapy, Puppeteer)"
    echo "  platform    - Enterprise platforms (ALwrity, Mautic) [manual setup]"
    echo "  seo         - Additional SEO CLI tools"
    echo "  nlp         - Advanced NLP libraries"
    echo "  all         - Install all automated tiers (foundation + power + seo + nlp)"
    echo ""
    echo "Examples:"
    echo "  bash QUICK-START-INSTALLATION.sh foundation"
    echo "  bash QUICK-START-INSTALLATION.sh all"
}

# Main installation logic
main() {
    TIER="${1:-help}"

    if [ "$TIER" = "help" ] || [ "$TIER" = "-h" ] || [ "$TIER" = "--help" ]; then
        show_usage
        exit 0
    fi

    echo ""
    print_status "Checking prerequisites..."
    check_npm
    check_python

    case "$TIER" in
        foundation)
            install_foundation
            ;;
        power)
            install_power
            ;;
        platform)
            install_platform
            ;;
        seo)
            install_seo_cli
            ;;
        nlp)
            install_advanced_nlp
            ;;
        all)
            install_foundation
            install_power
            install_seo_cli
            install_advanced_nlp
            echo ""
            print_success "=========================================="
            print_success "ALL AUTOMATED TIERS INSTALLED!"
            print_success "=========================================="
            echo ""
            print_warning "Platform tier requires manual setup. Run:"
            echo "  bash QUICK-START-INSTALLATION.sh platform"
            ;;
        *)
            print_error "Unknown tier: $TIER"
            show_usage
            exit 1
            ;;
    esac

    echo ""
    print_success "=========================================="
    print_success "Installation Complete!"
    print_success "=========================================="
    echo ""
    print_status "Next steps:"
    echo "  1. Review the full report: COPYWRITING-MARKETING-TOOLS-REPORT.md"
    echo "  2. Check JSON data: copywriting-marketing-tools-research-report.json"
    echo "  3. Configure MCP servers in AIOS config"
    echo "  4. Create AIOS skills for common workflows"
    echo ""
}

# Run main function
main "$@"
