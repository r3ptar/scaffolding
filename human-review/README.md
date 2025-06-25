# Human Review System - Terminal-Based Agent Management

A complete terminal-based system for managing multi-agent workflows with human oversight, designed to minimize your time reviewing and approving agent work while maintaining quality control.

## 🎯 Philosophy

- **Terminal-first**: No clicking, everything accessible via command line
- **Prioritized workflow**: Critical items surface immediately
- **Batch operations**: Approve multiple items efficiently  
- **Zero-configuration**: Works out of the box with sensible defaults
- **Integration-ready**: Connects with existing sprint and handoff systems

## 📦 Components

```
human-review/
├── human-review-template.md    # Centralized review queue template
├── update-review-queue.sh      # Agent script to add review items
├── quick-approve.sh           # Human terminal interface for approvals
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Copy to Your Project
```bash
cp -r docs/scaffolding/human-review /path/to/your-project/docs/
cd /path/to/your-project
```

### 2. Initialize Review System
```bash
# Create initial review queue (agents will update this)
cp docs/human-review/human-review-template.md docs/sprints/human-review.md

# Make scripts executable
chmod +x docs/human-review/*.sh
```

### 3. Daily Workflow
```bash
# Morning review (5 minutes)
cat docs/sprints/human-review.md | head -30   # Check critical items
./docs/human-review/quick-approve.sh --status  # Quick overview

# Approve/block items
./docs/human-review/quick-approve.sh agent-2 approve "Good API design"
./docs/human-review/quick-approve.sh agent-4 block "Security review needed"

# Batch operations
./docs/human-review/quick-approve.sh --batch medium  # Approve all medium items
```

## 🔧 Agent Integration

### For Agents: Adding Items to Review Queue

```bash
# Critical item (blocks other agents)
./docs/human-review/update-review-queue.sh --critical agent-3 \
  "Database schema change affects API and frontend" \
  --blocks="agent-1,agent-2" \
  --files="api/schema.sql,migrations/001_schema.sql"

# High priority with deadline
./docs/human-review/update-review-queue.sh --high agent-2 \
  "UI component API change needs approval" \
  --deadline="2025-06-26" \
  --confidence="medium"

# Medium priority improvement
./docs/human-review/update-review-queue.sh --medium agent-1 \
  "Suggest new testing framework" \
  --type="improvement" \
  --confidence="high"
```

### When to Request Review

**Critical Priority:**
- Decisions blocking other agents
- Architecture changes affecting multiple systems
- Security-sensitive modifications
- Breaking API changes

**High Priority:**
- Technical trade-offs requiring human judgment
- Performance optimizations with trade-offs
- Feature additions with UX impact
- Integration changes

**Medium Priority:**
- Process improvements
- Code quality suggestions  
- Tool/framework recommendations
- Documentation updates

## 💻 Human Terminal Interface

### Quick Status Check
```bash
./quick-approve.sh                    # Show overview
./quick-approve.sh --status           # Detailed status  
./quick-approve.sh --list             # List all pending items
```

### Approval Operations
```bash
# Single item approval
./quick-approve.sh agent-2 approve "Excellent work, proceed"
./quick-approve.sh agent-4 block "Needs security review first"
./quick-approve.sh agent-1 needs-revision "Change variable names"

# Batch operations
./quick-approve.sh --batch medium     # Approve all medium priority
./quick-approve.sh --interactive      # Step through each item
```

### Interactive Review Mode
```bash
./quick-approve.sh --interactive
```

This mode shows each pending item and prompts for decisions:
- `a` - Approve
- `b` - Block (requires reason)
- `r` - Request revision (requires changes)
- `s` - Skip for now
- `q` - Quit

## 📊 Integration with Sprint System

The review system automatically integrates with the sprint management system:

### Automatic Updates
- Review queue status updates sprint health indicators
- Agent blockers surface in sprint dashboard
- Completed reviews logged in sprint history
- Progress metrics include review latency

### Sprint File Integration
```bash
# The system automatically updates:
docs/sprints/current-sprint.md       # Sprint progress
docs/sprints/human-review.md         # Review queue
.decisions/                          # Decision history
```

## 🔄 Workflow Examples

### Morning Review Routine (5 minutes)
```bash
#!/bin/bash
# Save as: morning-review.sh

echo "🌅 Morning Agent Review"
./docs/human-review/quick-approve.sh --status

echo -e "\n🚨 Critical items requiring immediate attention:"
grep -A 5 "🚨 CRITICAL" docs/sprints/human-review.md

echo -e "\n⚡ Quick actions:"
echo "Run: ./docs/human-review/quick-approve.sh --interactive"
```

### End-of-Day Batch Review (10 minutes)
```bash
#!/bin/bash
# Save as: batch-review.sh

echo "🌆 End of Day Batch Review"

# Approve all high-confidence medium priority items
./docs/human-review/quick-approve.sh --batch medium

# Show remaining items for tomorrow
echo -e "\n📋 Items for tomorrow:"
./docs/human-review/quick-approve.sh --list

# Generate daily summary
echo -e "\n📊 Today's decisions:"
find .decisions -name "*-decision" -mtime -1 -exec basename {} \; | sed 's/-decision//' | nl
```

### Emergency Unblock Workflow
```bash
#!/bin/bash
# Save as: emergency-unblock.sh

echo "🚨 Emergency Agent Unblock"

# Show only critical blocked items
grep -A 10 "🚨 CRITICAL" docs/sprints/human-review.md

# Quick approve all non-security critical items
echo "Approving all non-security critical items..."
./docs/human-review/quick-approve.sh --batch critical
```

## 🎛️ Configuration

### Customizing Priority Thresholds
Edit `update-review-queue.sh` to adjust when items auto-escalate:

```bash
# In update-review-queue.sh, modify these sections:
# Lines that check for security keywords → auto-promote to critical
# Lines that check file patterns → auto-categorize by risk
# Default confidence levels by agent → adjust review frequency
```

### Notification Integration
```bash
# Add to quick-approve.sh for system notifications
notify-send "Review Needed" "Agent $agent_id added critical item"

# Add to update-review-queue.sh for email alerts
echo "Critical review needed" | mail -s "Agent Review" you@domain.com
```

## 📈 Metrics and Analytics

### Built-in Metrics
The system automatically tracks:
- Review latency (time from request to decision)
- Decision accuracy (follow-up changes needed)
- Agent request patterns (which agents need most oversight)
- Batch vs individual approval effectiveness

### Generating Reports
```bash
# Decision summary
find .decisions -name "*-decision" -mtime -7 | wc -l  # Decisions this week

# Average review time
find .decisions -name "*-decision" -exec grep TIMESTAMP {} \; | \
  awk '{print $2}' | sort | uniq -c

# Agent request frequency  
find .decisions -name "*-decision" | cut -d'-' -f1 | sort | uniq -c
```

## 🛠️ Troubleshooting

### Common Issues

**"Review file not found"**
```bash
# Initialize from template
cp docs/human-review/human-review-template.md docs/sprints/human-review.md
```

**"Permission denied on scripts"**
```bash
chmod +x docs/human-review/*.sh
```

**"Agent decisions not being read"**
```bash
# Check decisions directory
ls -la .decisions/
# Ensure agents are checking for decision files
```

**"Too many review items"**
```bash
# Batch approve safe items
./quick-approve.sh --batch medium
./quick-approve.sh --batch high --confidence=high
```

### Integration Issues

**Sprint file conflicts:**
- Ensure only one person edits sprint files
- Use the handoff system for coordination
- Back up sprint files before major changes

**Handoff system integration:**
- Verify handoff scripts can find review scripts
- Check relative path references in scripts
- Ensure both systems use same file structure

## 🔐 Security Considerations

### Decision Audit Trail
- All decisions logged with timestamps
- Decision reasons preserved
- File-based system allows git tracking
- Easy to review decision history

### Access Control
- Scripts require file system access
- No network dependencies
- Local-only operation by default
- Easy to add authentication if needed

## 🚀 Advanced Usage

### Custom Agent Workflows
```bash
# Agent-specific approval scripts
./quick-approve.sh agent-security-specialist approve "Security review complete"
./quick-approve.sh agent-performance-expert defer "Needs load testing first"
```

### Integration with CI/CD
```bash
# In CI pipeline, check for pending critical reviews
if grep -q "🚨 CRITICAL" docs/sprints/human-review.md; then
  echo "Critical reviews pending - blocking deployment"
  exit 1
fi
```

### Multi-Project Management
```bash
# Review across multiple projects
for project in project1 project2 project3; do
  echo "=== $project ==="
  cd $project && ./docs/human-review/quick-approve.sh --status
done
```

---

## 📚 Related Documentation

- **[Sprint System](../docs/sprints/README.md)** - Multi-agent coordination
- **[Context Handoff](../context-handoff/README.md)** - Session management
- **[TUI Interface](../tui/README.md)** - Visual agent management

---

**Result: 10-minute daily reviews instead of 30+ minutes, with better quality oversight! 🎯**