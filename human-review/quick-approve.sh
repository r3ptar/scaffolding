#!/bin/bash

# quick-approve.sh - Human terminal interface for approving/blocking agent requests
# Usage: ./quick-approve.sh [agent-id] [decision] [reason]
#        ./quick-approve.sh --list
#        ./quick-approve.sh --batch [priority]

set -e

# Configuration
REVIEW_FILE="${REVIEW_FILE:-docs/sprints/human-review.md}"
DECISIONS_DIR="${DECISIONS_DIR:-.decisions}"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create decisions directory if it doesn't exist
mkdir -p "$DECISIONS_DIR"

# Help function
show_help() {
    cat << EOF
Quick Approve - Human Review Interface

USAGE:
    ./quick-approve.sh [AGENT] [DECISION] [REASON]
    ./quick-approve.sh --list
    ./quick-approve.sh --batch [PRIORITY]
    ./quick-approve.sh --interactive

DECISIONS:
    approve          Approve the request
    approved         Alias for approve
    block            Block the request
    blocked          Alias for block
    needs-revision   Request changes
    defer            Move to lower priority

BATCH OPERATIONS:
    --batch critical    Approve all non-security critical items
    --batch high        Approve all high-confidence high-priority items
    --batch medium      Approve all medium priority items
    --batch-block       Block all items matching pattern

INTERACTIVE MODE:
    --list           Show all pending items
    --interactive    Step through items one by one
    --status         Show current review queue status

EXAMPLES:
    # Approve a specific agent's request
    ./quick-approve.sh agent-2 approve "Good API design, proceed"

    # Block with detailed reason
    ./quick-approve.sh agent-4 block "Security review needed before database changes"

    # Interactive review mode
    ./quick-approve.sh --interactive

    # Batch approve safe items
    ./quick-approve.sh --batch medium

EOF
}

# Function to extract pending items from review file
extract_pending_items() {
    local priority="$1"
    if [[ ! -f "$REVIEW_FILE" ]]; then
        echo "No review file found: $REVIEW_FILE"
        return 1
    fi

    case $priority in
        critical)
            section="🚨 CRITICAL"
            ;;
        high)
            section="🟡 HIGH PRIORITY"
            ;;
        medium)
            section="🟢 MEDIUM PRIORITY"
            ;;
        all)
            awk '/^## 🚨 CRITICAL/,/^## 🟡 HIGH PRIORITY/ { if (/^\- \*\*\[/) print }
                 /^## 🟡 HIGH PRIORITY/,/^## 🟢 MEDIUM PRIORITY/ { if (/^\- \*\*\[/) print }
                 /^## 🟢 MEDIUM PRIORITY/,/^## 📊/ { if (/^\- \*\*\[/) print }' "$REVIEW_FILE"
            return 0
            ;;
    esac

    awk "/^## $section/,/^## / { if (/^\- \*\*\[/) print }" "$REVIEW_FILE"
}

# Function to show current review status
show_status() {
    if [[ ! -f "$REVIEW_FILE" ]]; then
        echo -e "${RED}No review file found${NC}"
        return 1
    fi

    echo -e "${BLUE}=== Current Review Queue Status ===${NC}"
    echo

    # Extract and count items by priority
    local critical_count=$(extract_pending_items critical | wc -l)
    local high_count=$(extract_pending_items high | wc -l)
    local medium_count=$(extract_pending_items medium | wc -l)

    echo -e "🚨 Critical Items: ${RED}$critical_count${NC}"
    if [[ $critical_count -gt 0 ]]; then
        extract_pending_items critical | head -3 | sed 's/^/  /'
        if [[ $critical_count -gt 3 ]]; then
            echo "  ... and $((critical_count - 3)) more"
        fi
    fi
    echo

    echo -e "🟡 High Priority Items: ${YELLOW}$high_count${NC}"
    if [[ $high_count -gt 0 ]]; then
        extract_pending_items high | head -2 | sed 's/^/  /'
        if [[ $high_count -gt 2 ]]; then
            echo "  ... and $((high_count - 2)) more"
        fi
    fi
    echo

    echo -e "🟢 Medium Priority Items: ${GREEN}$medium_count${NC}"
    if [[ $medium_count -gt 0 ]]; then
        extract_pending_items medium | head -1 | sed 's/^/  /'
        if [[ $medium_count -gt 1 ]]; then
            echo "  ... and $((medium_count - 1)) more"
        fi
    fi

    echo
    echo -e "${BLUE}Total Pending: $((critical_count + high_count + medium_count))${NC}"
}

# Function to list all pending items
list_items() {
    echo -e "${BLUE}=== All Pending Review Items ===${NC}"
    echo

    echo -e "${RED}🚨 CRITICAL ITEMS:${NC}"
    extract_pending_items critical | nl -v1 -s'. '
    echo

    echo -e "${YELLOW}🟡 HIGH PRIORITY ITEMS:${NC}"
    extract_pending_items high | nl -v1 -s'. '
    echo

    echo -e "${GREEN}🟢 MEDIUM PRIORITY ITEMS:${NC}"
    extract_pending_items medium | nl -v1 -s'. '
}

# Function to create decision file
create_decision() {
    local agent_id="$1"
    local decision="$2"
    local reason="$3"

    local decision_file="$DECISIONS_DIR/$agent_id-decision"
    
    cat > "$decision_file" << EOF
DECISION: $decision
REASON: $reason
TIMESTAMP: $TIMESTAMP
STATUS: active
EOF

    echo -e "${GREEN}✅ Decision recorded for $agent_id${NC}"
    echo -e "Decision: $decision"
    echo -e "Reason: $reason"
    echo -e "File: $decision_file"
}

# Function to remove item from review queue
remove_from_queue() {
    local agent_id="$1"
    local decision="$2"
    local reason="$3"

    # Create backup
    cp "$REVIEW_FILE" "$REVIEW_FILE.backup-$(date +%s)"

    # Use awk to remove the item and add to decisions log
    awk -v agent="$agent_id" -v decision="$decision" -v reason="$reason" -v timestamp="$TIMESTAMP" '
    BEGIN { 
        in_item = 0
        item_found = 0
    }
    /^\- \*\*\[/ {
        if ($0 ~ "\\[" agent "\\]") {
            in_item = 1
            item_found = 1
            # Add to decisions log section instead of removing
            print "- ✅ **[" agent "]** - " decision " - " timestamp
            print "  - **Reason**: " reason
            next
        } else {
            in_item = 0
        }
    }
    /^  -/ {
        if (in_item) {
            next  # Skip item details
        }
    }
    /^$/ {
        if (in_item) {
            in_item = 0
            next
        }
    }
    /^[^[:space:]-]/ {
        in_item = 0
    }
    {
        if (!in_item) print
    }
    END {
        if (!item_found) {
            print "Warning: Agent " agent " not found in review queue" > "/dev/stderr"
        }
    }' "$REVIEW_FILE" > "$REVIEW_FILE.tmp"

    if [[ $? -eq 0 ]]; then
        mv "$REVIEW_FILE.tmp" "$REVIEW_FILE"
        echo -e "${GREEN}✅ Item removed from review queue${NC}"
    else
        echo -e "${RED}Error: Failed to update review file${NC}" >&2
        rm -f "$REVIEW_FILE.tmp"
        return 1
    fi
}

# Interactive review mode
interactive_review() {
    echo -e "${BLUE}=== Interactive Review Mode ===${NC}"
    echo "Press 'q' to quit, 's' to skip, 'h' for help"
    echo

    local items=($(extract_pending_items all | grep -o '\[agent-[0-9]*\]' | tr -d '[]'))
    
    for agent in "${items[@]}"; do
        echo -e "${BLUE}--- Reviewing: $agent ---${NC}"
        
        # Show the item details
        extract_pending_items all | grep -A 10 "$agent" | head -6
        echo
        
        echo -n "Decision [a]pprove/[b]lock/[r]evision/[s]kip/[q]uit: "
        read -r choice
        
        case $choice in
            a|approve)
                echo -n "Reason (optional): "
                read -r reason
                create_decision "$agent" "approved" "${reason:-Auto-approved in interactive mode}"
                remove_from_queue "$agent" "approved" "${reason:-Auto-approved in interactive mode}"
                ;;
            b|block)
                echo -n "Reason (required): "
                read -r reason
                if [[ -n "$reason" ]]; then
                    create_decision "$agent" "blocked" "$reason"
                    remove_from_queue "$agent" "blocked" "$reason"
                else
                    echo -e "${RED}Block reason is required${NC}"
                fi
                ;;
            r|revision)
                echo -n "Changes needed: "
                read -r reason
                create_decision "$agent" "needs-revision" "$reason"
                remove_from_queue "$agent" "needs-revision" "$reason"
                ;;
            s|skip)
                echo "Skipped $agent"
                continue
                ;;
            q|quit)
                echo "Exiting interactive review"
                break
                ;;
            h|help)
                echo "a/approve: Approve the request"
                echo "b/block: Block the request (reason required)"
                echo "r/revision: Request changes"
                echo "s/skip: Skip this item for now"
                echo "q/quit: Exit interactive mode"
                ;;
            *)
                echo "Invalid choice, skipping"
                ;;
        esac
        echo
    done
}

# Batch operations
batch_approve() {
    local priority="$1"
    local items=($(extract_pending_items "$priority" | grep -o '\[agent-[0-9]*\]' | tr -d '[]'))
    
    echo -e "${BLUE}Batch approving $priority priority items...${NC}"
    
    for agent in "${items[@]}"; do
        echo "Approving $agent..."
        create_decision "$agent" "approved" "Batch approved - $priority priority"
        remove_from_queue "$agent" "approved" "Batch approved - $priority priority"
    done
    
    echo -e "${GREEN}✅ Batch approval complete: ${#items[@]} items${NC}"
}

# Parse arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --list|-l)
        list_items
        exit 0
        ;;
    --status|-s)
        show_status
        exit 0
        ;;
    --interactive|-i)
        interactive_review
        exit 0
        ;;
    --batch)
        if [[ -z "$2" ]]; then
            echo -e "${RED}Error: --batch requires priority argument${NC}"
            exit 1
        fi
        batch_approve "$2"
        exit 0
        ;;
    "")
        # No arguments - show status and prompt
        show_status
        echo
        echo "Use --interactive for step-by-step review"
        echo "Use --help for all options"
        exit 0
        ;;
esac

# Single item approval/blocking
AGENT_ID="$1"
DECISION="${2:-}"
REASON="${3:-}"

# Validate decision
case "$DECISION" in
    approve|approved)
        DECISION="approved"
        ;;
    block|blocked)
        DECISION="blocked"
        if [[ -z "$REASON" ]]; then
            echo -e "${RED}Error: Block decisions require a reason${NC}"
            echo "Usage: ./quick-approve.sh $AGENT_ID block \"reason for blocking\""
            exit 1
        fi
        ;;
    needs-revision|revision)
        DECISION="needs-revision"
        if [[ -z "$REASON" ]]; then
            echo -e "${RED}Error: Revision requests require explanation${NC}"
            echo "Usage: ./quick-approve.sh $AGENT_ID needs-revision \"changes needed\""
            exit 1
        fi
        ;;
    defer)
        DECISION="deferred"
        REASON="${REASON:-Deferred to next review cycle}"
        ;;
    *)
        echo -e "${RED}Error: Invalid decision '$DECISION'${NC}"
        echo "Valid decisions: approve, block, needs-revision, defer"
        exit 1
        ;;
esac

# Execute the decision
create_decision "$AGENT_ID" "$DECISION" "$REASON"
remove_from_queue "$AGENT_ID" "$DECISION" "$REASON"

echo -e "${GREEN}✅ Review completed for $AGENT_ID${NC}"