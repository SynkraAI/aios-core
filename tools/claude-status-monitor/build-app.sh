#!/bin/bash

# Build ClaudeStatusMonitor.app bundle
# Usage: ./build-app.sh

set -euo pipefail

cd "$(dirname "$0")"

echo "🔨 Building Claude Status Monitor.app..."

# Build executable
swift build -c release

# Create app bundle structure
APP_DIR="ClaudeStatusMonitor.app"
rm -rf "$APP_DIR"

mkdir -p "$APP_DIR/Contents/MacOS"
mkdir -p "$APP_DIR/Contents/Resources"

# Copy executable
cp .build/release/ClaudeStatusMonitor "$APP_DIR/Contents/MacOS/"

# Create Info.plist
cat > "$APP_DIR/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>ClaudeStatusMonitor</string>
    <key>CFBundleIdentifier</key>
    <string>com.synkra.aios.ClaudeStatusMonitor</string>
    <key>CFBundleName</key>
    <string>Claude Status Monitor</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSUserNotificationAlertStyle</key>
    <string>alert</string>
</dict>
</plist>
EOF

echo "✅ Build complete!"
echo ""
echo "App criado em: $APP_DIR"
echo ""
echo "Para rodar:"
echo "  open $APP_DIR"
echo ""
echo "Para instalar:"
echo "  cp -r $APP_DIR ~/Applications/"
