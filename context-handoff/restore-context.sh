#!/bin/bash

# Simple Context Restoration Script
# Usage: ./restore-context.sh handoff-TIMESTAMP.md

set -e

if [ -z "$1" ]; then
    echo "📋 Available handoffs:"
    ls -1t handoff-*.md 2>/dev/null | head -10 | while read file; do
        timestamp=$(echo "$file" | sed 's/handoff-//' | sed 's/.md//')
        task=$(grep "## Current Task" "$file" -A 1 | tail -1)
        echo "  $timestamp - $task"
    done
    echo ""
    echo "Usage: $0 <handoff-file>"
    echo "Example: $0 handoff-20250622_232240.md"
    exit 1
fi

HANDOFF_FILE="$1"

if [ ! -f "$HANDOFF_FILE" ]; then
    echo "❌ Handoff file not found: $HANDOFF_FILE"
    exit 1
fi

echo "🔄 Restoring context from: $HANDOFF_FILE"
echo "=================================================="
echo ""

# Display the handoff content in a formatted way
cat "$HANDOFF_FILE"

echo ""
echo "=================================================="
echo "✅ Context restored! Key points:"

# Extract key information
TASK=$(grep "## Current Task" "$HANDOFF_FILE" -A 1 | tail -1)
BRANCH=$(grep "## Current Branch" "$HANDOFF_FILE" -A 1 | tail -1)
CHANGED_FILES=$(grep -A 100 "### Uncommitted Files:" "$HANDOFF_FILE" | grep "^- " | wc -l)

echo "📋 Task: $TASK"
echo "🌿 Branch: $BRANCH"
echo "📝 Changed files: $CHANGED_FILES"
echo ""
echo "🚀 Ready to continue development!"