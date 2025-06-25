# Complete Installation Guide - Terminal-Based Human-in-Loop Agent Management

**Version**: 1.0  
**Compatibility**: Any project using multi-agent development  
**Installation Time**: 5-10 minutes

## 🎯 What You're Installing

A complete terminal-based system for managing multi-agent workflows with human oversight:

1. **Human Review System** - Centralized terminal interface for agent approvals
2. **Enhanced Context Handoffs** - Priority-based session management  
3. **TUI Agent Manager** - Visual terminal interface (ranger-style)
4. **Daily Automation** - Streamlined review workflows
5. **Sprint Integration** - Connects with existing project management

## 📋 Prerequisites

### Required
- Bash shell (macOS/Linux/WSL)
- Python 3.6+ (for TUI interface)
- Git (for handoff integration)

### Optional but Recommended
- PM2 (for service monitoring in TUI)
- Node.js (for npm-based projects)
- An existing project with documentation structure

## 🚀 Quick Installation

### Option A: Full Installation (Recommended)
```bash
# 1. Navigate to your project root
cd /path/to/your-project

# 2. Copy entire scaffolding system
cp -r /path/to/scaffolding/docs/scaffolding ./docs/

# 3. Make scripts executable
find docs/scaffolding -name "*.sh" -exec chmod +x {} \;
chmod +x docs/scaffolding/tui/agent-manager.py

# 4. Initialize human review system
mkdir -p docs/sprints
cp docs/scaffolding/human-review/human-review-template.md docs/sprints/human-review.md

# 5. Copy daily automation
cp docs/scaffolding/automation/daily-review.sh ./
chmod +x daily-review.sh

# Done! Test installation:
./daily-review.sh status
```

### Option B: Selective Installation
```bash
# Install only what you need:

# Human Review System Only
cp -r docs/scaffolding/human-review docs/
chmod +x docs/human-review/*.sh

# Enhanced Handoffs Only  
cp -r docs/scaffolding/context-handoff docs/
chmod +x docs/context-handoff/*.sh

# TUI Interface Only
cp -r docs/scaffolding/tui docs/
chmod +x docs/tui/agent-manager.py
```

## 🔧 Configuration

### 1. Customize for Your Project Type

**Web Application:**
```bash
# Edit docs/scaffolding/human-review/human-review-template.md
# Update agent file ownership:
- **Agent 1**: `api/routes/`, `api/services/`
- **Agent 2**: `src/components/`, `src/pages/`  
- **Agent 3**: `migrations/`, `database/`
- **Agent 4**: `tests/`, `e2e/`
- **Agent 5**: `workers/`, `integrations/`
- **Agent 6**: `docs/`, `README.md`
```

**Game Development:**
```bash
- **Agent 1**: `src/gameplay/`, `src/mechanics/`
- **Agent 2**: `assets/`, `art/`
- **Agent 3**: `src/levels/`, `content/`
- **Agent 4**: `tests/`, `playtests/`
- **Agent 5**: `src/systems/`, `src/engine/`
- **Agent 6**: `docs/`, `README.md`
```

**Mobile App:**
```bash
- **Agent 1**: `src/ios/`, `platform/ios/`
- **Agent 2**: `src/android/`, `platform/android/`
- **Agent 3**: `src/shared/`, `src/components/`
- **Agent 4**: `tests/`, `__tests__/`
- **Agent 5**: `src/services/`, `src/api/`
- **Agent 6**: `docs/`, `README.md`
```

### 2. Set Up Sprint Integration
```bash
# If you have existing sprint system:
cp docs/scaffolding/docs/sprints/current-sprint.md docs/sprints/

# Update with your project details:
# - Sprint goals
# - Agent assignments  
# - File ownership matrix
# - Current tasks
```

### 3. Configure Notification Preferences
```bash
# Edit daily-review.sh for notifications:
# Line ~150: Add email notifications
# Line ~200: Add Slack/Discord webhooks
# Line ~250: Add desktop notifications
```

## 🧪 Testing Your Installation

### 1. Test Human Review System
```bash
# Add a test review item
./docs/human-review/update-review-queue.sh --medium test-agent "Test review item" --type="test"

# Check it appears in queue
cat docs/sprints/human-review.md

# Approve the test item
./docs/human-review/quick-approve.sh test-agent approve "Installation test successful"

# Verify decision was recorded
ls .decisions/
```

### 2. Test Enhanced Handoffs
```bash
# Create a test handoff
./docs/context-handoff/enhanced-handoff.sh "Testing enhanced handoff system" --priority medium --confidence high

# Verify handoff file created
ls handoff-*.md

# Test restoration
./docs/context-handoff/restore-context.sh handoff-*.md
```

### 3. Test TUI Interface
```bash
# Launch agent manager
python3 docs/scaffolding/tui/agent-manager.py

# Should show:
# - Agent status overview
# - Review queue items  
# - Interactive controls

# Exit with 'q'
```

### 4. Test Daily Automation
```bash
# Morning review test
./daily-review.sh morning

# Should show:
# - Status overview
# - Critical items (if any)
# - Suggested workflow
# - Time estimates
```

## 📊 Verification Checklist

After installation, verify these components work:

- [ ] **Human Review Queue**: Can add and approve items
- [ ] **Enhanced Handoffs**: Creates handoffs with priority flags
- [ ] **TUI Interface**: Launches and displays agent status
- [ ] **Daily Automation**: Morning/evening workflows run
- [ ] **Sprint Integration**: Updates sprint files correctly
- [ ] **Decision Tracking**: Creates and reads decision files
- [ ] **File Permissions**: All scripts are executable

## 🎨 Customization Examples

### Daily Review Automation
```bash
# Add to crontab for automatic morning briefings:
0 9 * * * cd /path/to/project && ./daily-review.sh morning > morning-briefing.txt

# Add to .bashrc for quick access:
alias morning-review='cd /path/to/project && ./daily-review.sh morning'
alias evening-review='cd /path/to/project && ./daily-review.sh evening'
alias agent-status='cd /path/to/project && python3 docs/scaffolding/tui/agent-manager.py'
```

### Project-Specific Scripts
```bash
# Create project-specific review script
cat > quick-review.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
./docs/human-review/quick-approve.sh --status
echo "Quick actions:"
echo "  approve: ./docs/human-review/quick-approve.sh agent-X approve 'reason'"
echo "  block:   ./docs/human-review/quick-approve.sh agent-X block 'reason'"
echo "  batch:   ./docs/human-review/quick-approve.sh --batch medium"
EOF
chmod +x quick-review.sh
```

### Integration with Existing Tools
```bash
# Git hooks integration
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Check for pending critical reviews before allowing commits
if grep -q "🚨 CRITICAL" docs/sprints/human-review.md 2>/dev/null; then
    echo "❌ Critical reviews pending - resolve before committing"
    exit 1
fi
EOF
chmod +x .git/hooks/pre-commit
```

## 🔧 Configuration Files

### Environment Variables
```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export REVIEW_FILE="docs/sprints/human-review.md"
export DECISIONS_DIR=".decisions"
export SPRINT_FILE="docs/sprints/current-sprint.md"
```

### Project Configuration
```bash
# Create project-specific config
cat > .agent-manager-config << 'EOF'
{
  "project_name": "Your Project",
  "agent_count": 6,
  "review_auto_refresh": 60,
  "priority_escalation": {
    "high_to_critical_hours": 4,
    "medium_to_high_hours": 24
  },
  "notification_preferences": {
    "critical_items": true,
    "daily_summary": true,
    "batch_approvals": false
  }
}
EOF
```

## 🚨 Troubleshooting

### Common Issues

**"Permission denied" on scripts:**
```bash
find docs/scaffolding -name "*.sh" -exec chmod +x {} \;
chmod +x docs/scaffolding/tui/agent-manager.py
```

**"Review file not found":**
```bash
mkdir -p docs/sprints
cp docs/scaffolding/human-review/human-review-template.md docs/sprints/human-review.md
```

**TUI interface crashes:**
```bash
# Check Python version
python3 --version  # Should be 3.6+

# Test with minimal mode
python3 -c "import curses; print('Curses available')"
```

**Handoffs not integrating with review system:**
```bash
# Check relative paths in enhanced-handoff.sh
# Ensure ../human-review/update-review-queue.sh exists
ls docs/scaffolding/human-review/update-review-queue.sh
```

### Performance Issues

**Slow TUI refresh:**
- Reduce auto-refresh frequency in agent-manager.py
- Limit number of handoff files scanned
- Use SSD for faster file operations

**Review queue getting too large:**
- Set up automatic archiving of old decisions
- Use batch operations more frequently
- Configure auto-approval for safe patterns

## 📈 Success Metrics

After 1 week of usage, you should see:

- **Review Time**: Reduced from 30+ minutes to 10 minutes daily
- **Agent Blocks**: Faster resolution of blocking issues
- **Decision Quality**: Consistent approval patterns
- **Context Retention**: Better handoff quality between sessions

Track these metrics:
```bash
# Daily decision count
find .decisions -name "*-decision" -mtime -1 | wc -l

# Average review latency  
grep TIMESTAMP .decisions/*-decision | awk '{print $2}' | sort

# Critical item resolution time
grep -l "critical" .decisions/*-decision | xargs ls -lt
```

## 🔄 Updates and Maintenance

### Keeping System Current
```bash
# Periodic updates (monthly)
# 1. Backup current configuration
cp -r docs/scaffolding docs/scaffolding.backup

# 2. Copy new version
cp -r /path/to/new-scaffolding/docs/scaffolding ./docs/

# 3. Restore customizations
# (merge project-specific changes)

# 4. Test functionality
./daily-review.sh status
```

### System Health Checks
```bash
# Weekly health check
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "🔍 System Health Check"
echo "Review queue: $(wc -l < docs/sprints/human-review.md) lines"
echo "Decisions: $(ls .decisions/ 2>/dev/null | wc -l) files"
echo "Handoffs: $(ls handoff-*.md 2>/dev/null | wc -l) files"
echo "Scripts executable: $(find docs/scaffolding -name "*.sh" -executable | wc -l)"
EOF
chmod +x health-check.sh
```

## 📚 Next Steps

After successful installation:

1. **Train Your Team**: Share the human review workflows
2. **Customize Workflows**: Adapt scripts to your project needs
3. **Monitor Usage**: Track metrics and improve processes
4. **Iterate**: Use the meta-improvement system to optimize

## 🎉 You're Ready!

Your terminal-based human-in-loop agent management system is now installed and configured. 

**Quick Start:**
```bash
./daily-review.sh morning    # Start your day
python3 docs/scaffolding/tui/agent-manager.py  # Visual overview
./docs/human-review/quick-approve.sh --interactive  # Handle reviews
```

**Questions?** Check the component READMEs in docs/scaffolding/ for detailed usage guides.

---

**Enjoy your optimized multi-agent development workflow! 🚀**