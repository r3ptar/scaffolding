#!/bin/bash

# Simple Context Handoff Script
# Usage: ./quick-handoff.sh "current task description"

set -e

# Get current timestamp for unique filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
HANDOFF_FILE="handoff-${TIMESTAMP}.md"

# Create handoff document
cat > "$HANDOFF_FILE" << EOF
# Context Handoff - $(date)

## Current Task
${1:-"No task specified"}

## Working Directory
$(pwd)

## Git Status
\`\`\`
$(git status --porcelain 2>/dev/null || echo "Not a git repository or git not available")
\`\`\`

## Recent Changes
### Uncommitted Files:
$(git diff --name-only 2>/dev/null | sed 's/^/- /' || echo "- None or git not available")

### Staged Files:
$(git diff --cached --name-only 2>/dev/null | sed 's/^/- /' || echo "- None or git not available")

## Last 3 Commits
\`\`\`
$(git log -3 --oneline 2>/dev/null || echo "No git history available")
\`\`\`

## Current Branch
$(git branch --show-current 2>/dev/null || echo "Unknown")

## Active Services (if any)
$(if command -v pm2 &> /dev/null; then pm2 status --no-colors 2>/dev/null | head -10 || echo "PM2 not running"; else echo "PM2 not available"; fi)

## Environment
- Platform: $(uname -s)
- Node Version: $(node --version 2>/dev/null || echo "Node not available")
- Working Directory: $(pwd)

## Next Steps
1. Review the current task above
2. Check git status for any uncommitted work
3. Continue from where previous agent left off

---
*Generated: $(date)*
EOF

echo "✅ Context handoff created: $HANDOFF_FILE"
echo "📋 Summary:"
echo "  - Task: ${1:-'No task specified'}"
echo "  - Files changed: $(git diff --name-only 2>/dev/null | wc -l || echo 0)"
echo "  - Current branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
echo ""
echo "To restore context in new session:"
echo "  cat $HANDOFF_FILE"