#!/bin/bash

# daily-review.sh - Automated daily workflow for human review
# Usage: ./daily-review.sh [morning|evening|emergency]

set -e

# Configuration
REVIEW_FILE="${REVIEW_FILE:-docs/sprints/human-review.md}"
SPRINT_FILE="${SPRINT_FILE:-docs/sprints/current-sprint.md}"
DECISIONS_DIR="${DECISIONS_DIR:-.decisions}"
HUMAN_REVIEW_SCRIPT="docs/human-review/quick-approve.sh"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default to morning if no argument
MODE="${1:-morning}"

# Helper functions
show_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}🤖 Daily Agent Review - $1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

count_items_by_priority() {
    if [[ ! -f "$REVIEW_FILE" ]]; then
        echo "0 0 0"
        return
    fi
    
    local critical=$(grep -c "🚨.*\[agent" "$REVIEW_FILE" 2>/dev/null || echo 0)
    local high=$(grep -c "🟡.*\[agent" "$REVIEW_FILE" 2>/dev/null || echo 0)
    local medium=$(grep -c "🟢.*\[agent" "$REVIEW_FILE" 2>/dev/null || echo 0)
    
    echo "$critical $high $medium"
}

show_decisions_summary() {
    if [[ ! -d "$DECISIONS_DIR" ]]; then
        echo "No decisions recorded yet"
        return
    fi
    
    echo -e "${BLUE}📊 Recent Decisions (Last 24h):${NC}"
    
    local today_decisions=$(find "$DECISIONS_DIR" -name "*-decision" -mtime -1 2>/dev/null | wc -l)
    local week_decisions=$(find "$DECISIONS_DIR" -name "*-decision" -mtime -7 2>/dev/null | wc -l)
    
    echo "  Today: $today_decisions decisions"
    echo "  This week: $week_decisions decisions"
    
    if [[ $today_decisions -gt 0 ]]; then
        echo
        echo "Today's decisions:"
        find "$DECISIONS_DIR" -name "*-decision" -mtime -1 2>/dev/null | while read -r file; do
            if [[ -f "$file" ]]; then
                local agent=$(basename "$file" -decision)
                local decision=$(grep "DECISION:" "$file" | cut -d' ' -f2-)
                local timestamp=$(grep "TIMESTAMP:" "$file" | cut -d' ' -f2- | cut -dT -f2 | cut -d. -f1)
                echo "  [$timestamp] $agent: $decision"
            fi
        done
    fi
}

morning_review() {
    show_header "Morning Review"
    
    # Check if review system is set up
    if [[ ! -f "$HUMAN_REVIEW_SCRIPT" ]]; then
        echo -e "${RED}❌ Human review system not found${NC}"
        echo "Run: cp -r docs/scaffolding/human-review docs/"
        exit 1
    fi
    
    # Quick status overview
    echo -e "${GREEN}🌅 Good morning! Here's your agent status:${NC}"
    echo
    
    "$HUMAN_REVIEW_SCRIPT" --status 2>/dev/null || {
        echo "Setting up review system..."
        mkdir -p "$(dirname "$REVIEW_FILE")"
        cp docs/scaffolding/human-review/human-review-template.md "$REVIEW_FILE" 2>/dev/null || echo "Template not found"
    }
    
    echo
    
    # Show critical items first
    read -r critical high medium <<< "$(count_items_by_priority)"
    
    if [[ $critical -gt 0 ]]; then
        echo -e "${RED}🚨 URGENT: $critical critical items need immediate attention!${NC}"
        echo
        grep -A 3 "🚨.*\[agent" "$REVIEW_FILE" 2>/dev/null | head -10
        echo
        echo -e "${YELLOW}⚡ Quick action: ./docs/human-review/quick-approve.sh --interactive${NC}"
        echo
    elif [[ $high -gt 0 ]]; then
        echo -e "${YELLOW}🟡 $high high-priority items for today's review${NC}"
        echo
    elif [[ $medium -gt 0 ]]; then
        echo -e "${GREEN}🟢 $medium medium-priority items (can wait for batch review)${NC}"
        echo
    else
        echo -e "${GREEN}✅ All caught up! No pending reviews${NC}"
        echo
    fi
    
    # Show recent decisions
    show_decisions_summary
    echo
    
    # Suggest workflow
    echo -e "${BLUE}💡 Suggested workflow:${NC}"
    if [[ $critical -gt 0 ]]; then
        echo "1. Handle critical items first: ./docs/human-review/quick-approve.sh --interactive"
        echo "2. Batch approve medium items: ./docs/human-review/quick-approve.sh --batch medium"
        echo "3. Check agent progress: cat docs/sprints/current-sprint.md"
    elif [[ $high -gt 0 ]]; then
        echo "1. Review high-priority items: ./docs/human-review/quick-approve.sh --interactive"
        echo "2. Batch approve medium items: ./docs/human-review/quick-approve.sh --batch medium"
    else
        echo "1. Check agent progress: cat docs/sprints/current-sprint.md"
        echo "2. Review any new handoffs: ls handoff-*.md"
        echo "3. Plan next sprint tasks if needed"
    fi
    
    echo
    echo -e "${GREEN}☕ Estimated review time: $((critical * 2 + high * 1 + medium / 3)) minutes${NC}"
}

evening_review() {
    show_header "Evening Review"
    
    echo -e "${GREEN}🌆 End of day review and cleanup${NC}"
    echo
    
    # Show what was accomplished today
    show_decisions_summary
    echo
    
    # Check for items that can be batch approved
    read -r critical high medium <<< "$(count_items_by_priority)"
    
    if [[ $medium -gt 0 ]]; then
        echo -e "${BLUE}🔄 Batch processing medium priority items...${NC}"
        echo "Found $medium medium priority items"
        echo -n "Approve all medium priority items? [y/N]: "
        read -r response
        
        if [[ "$response" == "y" || "$response" == "Y" ]]; then
            "$HUMAN_REVIEW_SCRIPT" --batch medium
            echo -e "${GREEN}✅ Batch approval complete${NC}"
        fi
        echo
    fi
    
    # Show remaining items for tomorrow
    read -r critical high medium <<< "$(count_items_by_priority)"
    
    if [[ $((critical + high + medium)) -gt 0 ]]; then
        echo -e "${YELLOW}📋 Items remaining for tomorrow:${NC}"
        echo "  Critical: $critical"
        echo "  High: $high"  
        echo "  Medium: $medium"
        echo
        
        if [[ $critical -gt 0 ]]; then
            echo -e "${RED}⚠️  Critical items will need first-thing-tomorrow attention${NC}"
        fi
    else
        echo -e "${GREEN}🎉 All reviews complete! Clean slate for tomorrow${NC}"
    fi
    
    echo
    
    # Sprint progress summary
    if [[ -f "$SPRINT_FILE" ]]; then
        echo -e "${BLUE}📊 Sprint Progress Summary:${NC}"
        grep -A 5 "Sprint Health:" "$SPRINT_FILE" 2>/dev/null || echo "Sprint file not found"
        echo
    fi
    
    # Suggest preparation for tomorrow
    echo -e "${BLUE}🌅 Tomorrow's preparation:${NC}"
    echo "1. Check for overnight agent handoffs"
    echo "2. Review any critical items first"
    echo "3. Update sprint progress"
    
    echo
    echo -e "${GREEN}😴 Good night! All systems ready for tomorrow${NC}"
}

emergency_review() {
    show_header "Emergency Unblock"
    
    echo -e "${RED}🚨 Emergency agent unblock workflow${NC}"
    echo
    
    # Show only critical items
    read -r critical high medium <<< "$(count_items_by_priority)"
    
    if [[ $critical -eq 0 ]]; then
        echo -e "${GREEN}✅ No critical blockers found${NC}"
        echo
        if [[ $high -gt 0 ]]; then
            echo -e "${YELLOW}Found $high high-priority items (not blocking)${NC}"
        fi
        echo "Emergency unblock not needed"
        return
    fi
    
    echo -e "${RED}Found $critical critical blocking items:${NC}"
    echo
    
    # Show critical items with context
    grep -A 5 "🚨.*\[agent" "$REVIEW_FILE" 2>/dev/null
    echo
    
    # Auto-approve safe critical items
    echo -e "${YELLOW}🔍 Analyzing for auto-approval...${NC}"
    
    # Check if any are non-security related
    local safe_items=0
    if grep -q "🚨.*\[agent" "$REVIEW_FILE" 2>/dev/null; then
        while IFS= read -r line; do
            if [[ "$line" =~ 🚨.*\[agent ]]; then
                # Skip if contains security keywords
                if ! echo "$line" | grep -qi "security\|auth\|password\|token\|private\|secret"; then
                    ((safe_items++))
                fi
            fi
        done < <(grep "🚨.*\[agent" "$REVIEW_FILE" 2>/dev/null)
    fi
    
    if [[ $safe_items -gt 0 ]]; then
        echo "Found $safe_items potentially safe items for auto-approval"
        echo -n "Auto-approve non-security critical items? [y/N]: "
        read -r response
        
        if [[ "$response" == "y" || "$response" == "Y" ]]; then
            # This would need custom logic to identify and approve safe items
            echo "⚠️  Auto-approval logic not implemented - manual review required"
            echo "Use: ./docs/human-review/quick-approve.sh --interactive"
        fi
    else
        echo "All critical items require manual review (security-related)"
    fi
    
    echo
    echo -e "${BLUE}⚡ Next steps:${NC}"
    echo "1. Review each critical item: ./docs/human-review/quick-approve.sh --interactive"
    echo "2. Check which agents are blocked: grep -A 2 'BLOCKING' docs/sprints/human-review.md"
    echo "3. Notify relevant agents of decisions"
    
    echo
    echo -e "${YELLOW}📞 If urgent: Contact agents directly while reviewing${NC}"
}

status_check() {
    echo -e "${BLUE}📊 Quick Status Check${NC}"
    echo
    
    read -r critical high medium <<< "$(count_items_by_priority)"
    echo "Review Queue:"
    echo "  🚨 Critical: $critical"
    echo "  🟡 High: $high"
    echo "  🟢 Medium: $medium"
    echo
    
    if [[ -f "$HUMAN_REVIEW_SCRIPT" ]]; then
        "$HUMAN_REVIEW_SCRIPT" --status 2>/dev/null | head -10
    fi
}

# Main execution
case "$MODE" in
    morning|m)
        morning_review
        ;;
    evening|e)
        evening_review
        ;;
    emergency|emerg|unblock)
        emergency_review
        ;;
    status|s)
        status_check
        ;;
    *)
        echo "Usage: $0 [morning|evening|emergency|status]"
        echo
        echo "Modes:"
        echo "  morning   - Start of day review workflow"
        echo "  evening   - End of day cleanup and batch operations"
        echo "  emergency - Unblock critical items quickly"
        echo "  status    - Quick status check"
        echo
        echo "Examples:"
        echo "  $0 morning    # Morning review routine"
        echo "  $0 evening    # Evening cleanup"
        echo "  $0 emergency  # Emergency unblock"
        exit 1
        ;;
esac