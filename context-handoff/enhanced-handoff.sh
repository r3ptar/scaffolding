#!/bin/bash

# Enhanced Context Handoff Script with Human Review Integration
# Usage: ./enhanced-handoff.sh "task description" [options]

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
HANDOFF_FILE="handoff-${TIMESTAMP}.md"
REVIEW_SCRIPT="../human-review/update-review-queue.sh"

# Default values
TASK_DESC=""
PRIORITY=""
CONFIDENCE="medium"
REVIEW_NEEDED="false"
BLOCKERS=""
HANDOFF_REASON=""
NEXT_AGENT=""

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Help function
show_help() {
    cat << EOF
Enhanced Context Handoff with Human Review Integration

USAGE:
    ./enhanced-handoff.sh "task description" [OPTIONS]

OPTIONS:
    --priority LEVEL         critical|high|medium|low (default: medium)
    --confidence LEVEL       high|medium|low (default: medium)
    --review-needed         Flag that human review is required
    --blockers TEXT         Describe what's blocking progress
    --reason REASON         Why creating handoff (completed|context-limit|blocked|switching)
    --next-agent ID         Which agent should take over (agent-1, agent-2, etc.)
    --help                  Show this help

EXAMPLES:
    # Standard handoff
    ./enhanced-handoff.sh "implementing API endpoints"

    # High priority with review needed
    ./enhanced-handoff.sh "database schema change" --priority high --review-needed --blockers "needs security approval"

    # Task completion handoff
    ./enhanced-handoff.sh "completed authentication system" --reason completed --confidence high --next-agent agent-2

    # Context limit handoff
    ./enhanced-handoff.sh "debugging integration tests" --reason context-limit --priority medium

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --priority)
            PRIORITY="$2"
            shift 2
            ;;
        --confidence)
            CONFIDENCE="$2"
            shift 2
            ;;
        --review-needed)
            REVIEW_NEEDED="true"
            shift
            ;;
        --blockers)
            BLOCKERS="$2"
            shift 2
            ;;
        --reason)
            HANDOFF_REASON="$2"
            shift 2
            ;;
        --next-agent)
            NEXT_AGENT="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            if [[ -z "$TASK_DESC" ]]; then
                TASK_DESC="$1"
            else
                echo -e "${RED}Error: Unknown argument '$1'${NC}" >&2
                echo "Use --help for usage information"
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate required arguments
if [[ -z "$TASK_DESC" ]]; then
    echo -e "${RED}Error: Task description is required${NC}" >&2
    echo "Usage: ./enhanced-handoff.sh \"task description\" [options]"
    exit 1
fi

# Set default priority if not specified
if [[ -z "$PRIORITY" ]]; then
    case "$HANDOFF_REASON" in
        blocked)
            PRIORITY="high"
            ;;
        completed)
            PRIORITY="low"
            ;;
        context-limit)
            PRIORITY="medium"
            ;;
        *)
            PRIORITY="medium"
            ;;
    esac
fi

# Auto-detect handoff reason if not specified
if [[ -z "$HANDOFF_REASON" ]]; then
    if [[ -n "$BLOCKERS" ]]; then
        HANDOFF_REASON="blocked"
    elif [[ "$TASK_DESC" =~ ^(completed|finished|done) ]]; then
        HANDOFF_REASON="completed"
    else
        HANDOFF_REASON="switching"
    fi
fi

# Function to analyze project state
analyze_project_state() {
    local state_summary=""
    
    # Check git status
    local modified_files=$(git diff --name-only 2>/dev/null | wc -l)
    local staged_files=$(git diff --cached --name-only 2>/dev/null | wc -l)
    local untracked_files=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l)
    
    if [[ $modified_files -gt 0 || $staged_files -gt 0 || $untracked_files -gt 0 ]]; then
        state_summary="⚠️ Uncommitted changes detected"
    else
        state_summary="✅ Clean working directory"
    fi
    
    # Check for common signs of incomplete work
    if git diff 2>/dev/null | grep -q "TODO\|FIXME\|XXX"; then
        state_summary+=", 🔧 TODO items in changes"
    fi
    
    echo "$state_summary"
}

# Function to suggest next actions
suggest_next_actions() {
    case "$HANDOFF_REASON" in
        completed)
            echo "1. Review completed work and test integration"
            echo "2. Update sprint progress and mark task complete"
            echo "3. Begin next priority task from sprint backlog"
            ;;
        blocked)
            echo "1. Address blocking issues: $BLOCKERS"
            if [[ "$REVIEW_NEEDED" == "true" ]]; then
                echo "2. Wait for human review and approval"
            fi
            echo "3. Consider alternative approaches or workarounds"
            ;;
        context-limit)
            echo "1. Review handoff context and recent changes"
            echo "2. Continue implementation from current point"
            echo "3. Consider breaking down large task into smaller pieces"
            ;;
        switching)
            echo "1. Review current progress and understand context"
            echo "2. Determine next steps for task completion"
            echo "3. Continue or modify approach as needed"
            ;;
    esac
}

# Create enhanced handoff document
cat > "$HANDOFF_FILE" << EOF
# Enhanced Context Handoff - $(date)

## 📋 Task Summary
**Description**: $TASK_DESC  
**Priority**: $PRIORITY  
**Confidence**: $CONFIDENCE  
**Handoff Reason**: $HANDOFF_REASON  
**Review Needed**: $REVIEW_NEEDED  
$(if [[ -n "$NEXT_AGENT" ]]; then echo "**Next Agent**: $NEXT_AGENT"; fi)

$(if [[ -n "$BLOCKERS" ]]; then cat << BLOCKERS_SECTION

## 🚨 Blockers
$BLOCKERS
BLOCKERS_SECTION
fi)

## 🎯 Project State Analysis
$(analyze_project_state)

## 📁 Working Context
**Directory**: $(pwd)  
**Branch**: $(git branch --show-current 2>/dev/null || echo "Unknown")  
**Last Commit**: $(git log -1 --oneline 2>/dev/null || echo "No commits")

## 📊 Git Status
\`\`\`
$(git status --porcelain 2>/dev/null || echo "Not a git repository or git not available")
\`\`\`

## 🔄 Recent Changes
### Modified Files:
$(git diff --name-only 2>/dev/null | sed 's/^/- /' || echo "- None")

### Staged Files:
$(git diff --cached --name-only 2>/dev/null | sed 's/^/- /' || echo "- None")

### New Files:
$(git ls-files --others --exclude-standard 2>/dev/null | sed 's/^/- /' || echo "- None")

## 📈 Recent Commit History
\`\`\`
$(git log -5 --oneline 2>/dev/null || echo "No git history available")
\`\`\`

## 🔧 Technical Context
### Development Environment:
- Platform: $(uname -s)
- Node Version: $(node --version 2>/dev/null || echo "Node not available")
- Working Directory: $(pwd)

### Active Services:
$(if command -v pm2 &> /dev/null; then 
    echo "\`\`\`"
    pm2 status --no-colors 2>/dev/null | head -10 || echo "PM2 not running"
    echo "\`\`\`"
else 
    echo "PM2 not available"
fi)

### Key Dependencies Status:
$(if [[ -f "package.json" ]]; then
    echo "- Node project detected"
    if [[ -f "package-lock.json" ]]; then
        echo "- Dependencies locked"
    else
        echo "- ⚠️ No lock file found"
    fi
fi)

$(if [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]]; then
    echo "- Python project detected"
fi)

## 🎯 Suggested Next Actions
$(suggest_next_actions)

## 🔍 Code Context Clues
$(if git diff --name-only 2>/dev/null | head -5 | while read -r file; do
    if [[ -f "$file" ]]; then
        echo "### Recently Modified: $file"
        echo "\`\`\`"
        git diff "$file" 2>/dev/null | head -20 | tail -15 || echo "Could not show diff"
        echo "\`\`\`"
        echo
    fi
done)

## 📝 Notes for Next Agent
$(case "$HANDOFF_REASON" in
    completed)
        echo "Task has been completed successfully. Next agent should:"
        echo "- Verify the implementation works as expected"
        echo "- Run tests to ensure no regressions"
        echo "- Update documentation if needed"
        ;;
    blocked)
        echo "Work is blocked and requires attention. Next agent should:"
        echo "- Address the blocking issues listed above"
        echo "- Consider alternative approaches"
        if [[ "$REVIEW_NEEDED" == "true" ]]; then
            echo "- Wait for human review before proceeding"
        fi
        ;;
    context-limit)
        echo "Handoff due to context limits. Next agent should:"
        echo "- Review recent changes carefully"
        echo "- Continue from current implementation point"
        echo "- Consider breaking work into smaller tasks"
        ;;
    switching)
        echo "Task switching handoff. Next agent should:"
        echo "- Understand current progress and goals"
        echo "- Decide whether to continue or change approach"
        echo "- Update task status in sprint tracking"
        ;;
esac)

---
**Generated**: $(date)  
**Agent ID**: ${USER:-unknown}  
**Session Duration**: Estimate based on recent commits  
**Handoff ID**: $TIMESTAMP
EOF

# Output handoff created message
echo -e "${GREEN}✅ Enhanced context handoff created: $HANDOFF_FILE${NC}"
echo
echo -e "${BLUE}📋 Handoff Summary:${NC}"
echo -e "  Task: $TASK_DESC"
echo -e "  Priority: $PRIORITY"
echo -e "  Confidence: $CONFIDENCE"
echo -e "  Reason: $HANDOFF_REASON"
if [[ -n "$BLOCKERS" ]]; then
    echo -e "  Blockers: $BLOCKERS"
fi
echo

# Create human review item if needed
if [[ "$REVIEW_NEEDED" == "true" && -f "$REVIEW_SCRIPT" ]]; then
    echo -e "${YELLOW}🔔 Adding to human review queue...${NC}"
    
    local review_priority="medium"
    case "$PRIORITY" in
        critical|high)
            review_priority="high"
            ;;
        low)
            review_priority="medium"
            ;;
    esac
    
    local review_desc="Handoff review needed: $TASK_DESC"
    if [[ -n "$BLOCKERS" ]]; then
        review_desc="$review_desc (BLOCKED: $BLOCKERS)"
        review_priority="critical"
    fi
    
    "$REVIEW_SCRIPT" "--$review_priority" "handoff-$TIMESTAMP" "$review_desc" \
        --confidence "$CONFIDENCE" \
        --files "$HANDOFF_FILE" || echo -e "${RED}Failed to add to review queue${NC}"
fi

# Update sprint status if in sprint directory
if [[ -f "docs/sprints/current-sprint.md" ]]; then
    echo -e "${BLUE}📊 Updating sprint progress...${NC}"
    
    # Add handoff to sprint tracking
    if ! grep -q "## 🔄 Recent Handoffs" docs/sprints/current-sprint.md; then
        cat >> docs/sprints/current-sprint.md << EOF

## 🔄 Recent Handoffs
EOF
    fi
    
    # Add this handoff to the list
    sed -i.bak "/## 🔄 Recent Handoffs/a\\
- **$(date '+%Y-%m-%d %H:%M')**: $TASK_DESC ($HANDOFF_REASON) - Priority: $PRIORITY\\
" docs/sprints/current-sprint.md
fi

echo -e "${GREEN}To restore context in new session:${NC}"
echo -e "  cat $HANDOFF_FILE"
echo
echo -e "${GREEN}Quick restoration:${NC}"
echo -e "  ./restore-context.sh $HANDOFF_FILE"