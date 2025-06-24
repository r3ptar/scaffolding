#!/bin/bash

# Sprint System Installation Script
# Usage: ./install-sprint-system.sh [target-directory]

set -e

TARGET_DIR=${1:-"."}
SPRINT_DIR="$TARGET_DIR/docs/sprints"

echo "🚀 Installing Essential Sprint System..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p "$SPRINT_DIR"

# Copy all sprint system files
echo "📋 Copying sprint system files..."
cp docs/sprints/README.md "$SPRINT_DIR/"
cp docs/sprints/current-sprint.md "$SPRINT_DIR/"
cp docs/sprints/sprint-archive.md "$SPRINT_DIR/"
cp docs/sprints/ESSENTIAL_SPRINT_SYSTEM.md "$SPRINT_DIR/"
cp docs/sprints/IMPLEMENTATION_STATUS_TEMPLATE.md "$SPRINT_DIR/"

echo "✅ Sprint system installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit $SPRINT_DIR/current-sprint.md with your sprint details"
echo "2. Customize file ownership for your team"
echo "3. Add sprint link to your main project documentation"
echo ""
echo "🎯 Quick start prompt for Claude Code:"
echo "\"Set up sprint system using the files in docs/sprints/. Check existing implementation before planning features.\""
echo ""
echo "📚 Documentation: $SPRINT_DIR/README.md"