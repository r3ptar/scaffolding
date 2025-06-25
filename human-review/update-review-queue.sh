#!/bin/bash

# update-review-queue.sh - Agent script to add items to human review queue
# Usage: ./update-review-queue.sh --critical|--high|--medium "agent-id" "description" [options]

set -e

# Configuration
REVIEW_FILE="${REVIEW_FILE:-docs/sprints/human-review.md}"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
AGENT_ID=""
DESCRIPTION=""
PRIORITY=""
BLOCKS=""
DEADLINE=""
TYPE=""
CONFIDENCE=""
FILES=""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Help function
show_help() {
    cat << EOF
Update Human Review Queue

USAGE:
    ./update-review-queue.sh [PRIORITY] [AGENT] [DESCRIPTION] [OPTIONS]

PRIORITIES:
    --critical     Requires immediate review (blocks other agents)
    --high         Should be reviewed within 24 hours
    --medium       Can wait for weekly batch review

REQUIRED ARGUMENTS:
    AGENT          Agent identifier (e.g., agent-1, agent-2)
    DESCRIPTION    Brief description of what needs review

OPTIONS:
    --blocks AGENTS        Comma-separated list of blocked agents (critical only)
    --deadline DATE        When decision is needed (high priority)
    --type TYPE           improvement|feature|optimization|documentation
    --confidence LEVEL     high|medium|low
    --files PATHS         Comma-separated list of relevant files
    --help                Show this help

EXAMPLES:
    # Critical item blocking other agents
    ./update-review-queue.sh --critical agent-3 "Database schema change affects API" --blocks="agent-1,agent-2" --files="api/schema.sql"

    # High priority with deadline
    ./update-review-queue.sh --high agent-2 "UI component API change needs approval" --deadline="2025-06-26" --confidence="medium"

    # Medium priority improvement
    ./update-review-queue.sh --medium agent-1 "Suggest new testing framework" --type="improvement" --confidence="high"

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --critical|--high|--medium)
            PRIORITY="${1#--}"
            shift
            ;;
        --blocks)
            BLOCKS="$2"
            shift 2
            ;;
        --deadline)
            DEADLINE="$2"
            shift 2
            ;;
        --type)
            TYPE="$2"
            shift 2
            ;;
        --confidence)
            CONFIDENCE="$2"
            shift 2
            ;;
        --files)
            FILES="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            if [[ -z "$AGENT_ID" ]]; then
                AGENT_ID="$1"
            elif [[ -z "$DESCRIPTION" ]]; then
                DESCRIPTION="$1"
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
if [[ -z "$PRIORITY" || -z "$AGENT_ID" || -z "$DESCRIPTION" ]]; then
    echo -e "${RED}Error: Missing required arguments${NC}" >&2
    echo "Usage: ./update-review-queue.sh [--critical|--high|--medium] [agent-id] [description]"
    echo "Use --help for more information"
    exit 1
fi

# Validate priority-specific requirements
case $PRIORITY in
    critical)
        if [[ -z "$BLOCKS" ]]; then
            echo -e "${YELLOW}Warning: Critical items should specify --blocks${NC}" >&2
        fi
        ;;
    high)
        if [[ -z "$DEADLINE" ]]; then
            echo -e "${YELLOW}Warning: High priority items should specify --deadline${NC}" >&2
        fi
        ;;
    medium)
        if [[ -z "$TYPE" ]]; then
            echo -e "${YELLOW}Warning: Medium priority items should specify --type${NC}" >&2
        fi
        ;;
esac

# Create review file if it doesn't exist
if [[ ! -f "$REVIEW_FILE" ]]; then
    echo -e "${YELLOW}Creating new review file: $REVIEW_FILE${NC}"
    cp "$(dirname "$0")/human-review-template.md" "$REVIEW_FILE"
fi

# Create backup
cp "$REVIEW_FILE" "$REVIEW_FILE.backup-$(date +%s)"

# Function to add item to specific priority section
add_review_item() {
    local section_marker=""
    local item_content=""
    
    case $PRIORITY in
        critical)
            section_marker="## 🚨 CRITICAL (Review Immediately)"
            item_content="- **[$AGENT_ID]** - $DESCRIPTION - **BLOCKING** [$BLOCKS]
  - **Impact**: [Affects multiple agents/systems]
  - **Decision Needed**: [Specific approval/decision required]
  - **Files**: $FILES
  - **Added**: $TIMESTAMP
  - **Quick Action**: \`echo \"approved|blocked|needs-revision\" > .${AGENT_ID}-decision\`"
            ;;
        high)
            section_marker="## 🟡 HIGH PRIORITY (Daily Review)"
            item_content="- **[$AGENT_ID]** - $DESCRIPTION
  - **Confidence**: ${CONFIDENCE:-🟡}
  - **Integration Impact**: [Review impact on other agents]
  - **Deadline**: ${DEADLINE:-TBD}
  - **Files**: $FILES
  - **Added**: $TIMESTAMP"
            ;;
        medium)
            section_marker="## 🟢 MEDIUM PRIORITY (Weekly Batch Review)"
            item_content="- **[$AGENT_ID]** - $DESCRIPTION
  - **Type**: ${TYPE:-Improvement}
  - **Effort**: [Time/complexity estimate needed]
  - **Value**: [Expected benefit]
  - **Confidence**: ${CONFIDENCE:-🟡}
  - **Added**: $TIMESTAMP"
            ;;
    esac

    # Use awk to insert the item after the appropriate section header
    awk -v section="$section_marker" -v item="$item_content" '
    BEGIN { found_section = 0; inserted = 0 }
    {
        print $0
        if ($0 ~ section && !inserted) {
            found_section = 1
            # Skip the comment line and any empty items
            getline; print $0  # Print comment line
            if (getline > 0 && $0 ~ /^\*\*\[No.*items\]/) {
                # Replace "No items" line with our item
                print ""
                print item
                inserted = 1
            } else {
                # Add to existing items
                print $0
                print ""
                print item
                inserted = 1
            }
        }
    }
    END {
        if (!inserted) {
            print "Error: Could not find section: " section > "/dev/stderr"
            exit 1
        }
    }' "$REVIEW_FILE" > "$REVIEW_FILE.tmp"

    if [[ $? -eq 0 ]]; then
        mv "$REVIEW_FILE.tmp" "$REVIEW_FILE"
    else
        echo -e "${RED}Error: Failed to update review file${NC}" >&2
        rm -f "$REVIEW_FILE.tmp"
        exit 1
    fi
}

# Update the timestamp in the file
sed -i.bak "s/\*\*Last Updated\*\*:.*/\*\*Last Updated\*\*: $TIMESTAMP/" "$REVIEW_FILE"

# Add the review item
add_review_item

# Update sprint status based on priority
case $PRIORITY in
    critical)
        sed -i.bak "s/\*\*Review Status\*\*:.*/\*\*Review Status\*\*: 🔴 Critical Issues/" "$REVIEW_FILE"
        ;;
    high)
        # Only change if not already critical
        if ! grep -q "🔴 Critical Issues" "$REVIEW_FILE"; then
            sed -i.bak "s/\*\*Review Status\*\*:.*/\*\*Review Status\*\*: 🟡 Needs Attention/" "$REVIEW_FILE"
        fi
        ;;
esac

# Clean up backup files
rm -f "$REVIEW_FILE.bak"

# Output success message
echo -e "${GREEN}✅ Successfully added $PRIORITY priority item to review queue${NC}"
echo -e "Agent: $AGENT_ID"
echo -e "Description: $DESCRIPTION"

# Show critical item warning
if [[ "$PRIORITY" == "critical" ]]; then
    echo -e "${RED}⚠️  CRITICAL ITEM ADDED - HUMAN REVIEW NEEDED IMMEDIATELY${NC}"
    echo -e "This item is blocking: $BLOCKS"
fi

# Optional: Send notification (uncomment if you have notification system)
# notify-send "Review Queue Updated" "$AGENT_ID added $PRIORITY priority item: $DESCRIPTION"

echo -e "Review file updated: $REVIEW_FILE"