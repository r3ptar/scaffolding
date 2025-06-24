# Bug Detection System Setup Guide

**Version**: 1.0.0  
**Last Updated**: June 23, 2025  
**Time to Setup**: ~10 minutes

## Prerequisites

- A project with source code to analyze
- Claude Code installed and configured
- Basic understanding of your project structure

## Step 1: Copy System to Your Project

### Option A: Direct Copy
```bash
# From your project root
cp -r path/to/bug-detection-system docs/bugs
```

### Option B: Manual Setup
1. Create the directory structure:
```bash
mkdir -p docs/bugs/{active,fixed,templates,workflows}
```

2. Copy all files from this scaffolding to the appropriate directories

## Step 2: Create Initial Bug Index

Create `docs/bugs/BUG_INDEX.md`:

```markdown
# Bug Index

**Last Updated**: [Today's Date]  
**Total Active Bugs**: 0  
**Next Bug ID**: BUG-001  

## Bug Severity Levels

### 🔴 Critical (0)
*System breaking, security vulnerabilities, data loss risks*

### 🟠 High (0)
*Major functionality issues, significant UX problems*

### 🟡 Medium (0)
*Minor functionality issues, cosmetic problems*

### 🟢 Low (0)
*Nice-to-have fixes, minor improvements*

## Component Categories

- Authentication & Auth Flow
- API/Backend
- UI/Navigation
- Mobile Interface
- Performance
- Security
- [Add your project-specific components]

## Metrics

- **Bugs Found This Week**: 0
- **Bugs Fixed This Week**: 0
- **Average Time to Fix**: N/A
- **Most Affected Component**: N/A
```

## Step 3: Customize for Your Project

### 3.1 Update Component Categories

Edit the component list in:
- `BUG_INDEX.md`
- `templates/bug-report-template.md`
- `workflows/claude-code-usage.md`

Example for a React + Node.js project:
```markdown
## Component Categories
- Frontend/React Components
- Backend/Express Routes
- Database/Queries
- Authentication/JWT
- State Management/Redux
- API Integration
- Testing
- DevOps/CI-CD
```

### 3.2 Adjust Bug Patterns

Edit `workflows/claude-code-usage.md` to add project-specific patterns:

For React:
```
- "useEffect.*\[\]" - Missing dependencies
- "async.*useEffect" - Async in useEffect
- "key=\{index\}" - Array index as key
```

For Node.js:
```
- "process\.env\." without validation
- "app\.get.*:id.*parseInt" - Unvalidated params
- "catch\s*\(\s*\)" - Empty catch blocks
```

### 3.3 Configure Agent Specializations

If using multi-agent mode, update `agent-specializations.md` for your tech stack:

Example for MERN Stack:
```markdown
### 🔐 Authentication Specialist
**File Targeting Keywords:**
- `auth`, `jwt`, `token`, `passport`, `session`, `bcrypt`

### 🗄️ Database Specialist  
**File Targeting Keywords:**
- `model`, `schema`, `mongoose`, `query`, `aggregate`, `populate`

### ⚛️ React Specialist
**File Targeting Keywords:**
- `component`, `hook`, `useState`, `useEffect`, `redux`, `context`
```

## Step 4: Test the System

Run your first bug sweep to ensure everything works:

```
Please run a test bug sweep on a single file:

1. Read docs/bugs/BUG_INDEX.md to verify it exists
2. Choose one source file from my project
3. Analyze it for common bug patterns
4. Create a bug report if any issues are found
5. Update the bug index

This is a test run to ensure the bug detection system is properly set up.
```

## Step 5: Establish Team Workflows

### Daily Workflow
```markdown
## Daily Bug Detection Process

**Morning (Before Coding)**
1. Run quick sweep on changed files
2. Review any critical bugs found
3. Plan fixes for the day

**Before Commits**
1. Run focused sweep on staged files
2. Fix any high-priority issues
3. Update bug status
```

### Weekly Workflow
```markdown
## Weekly Comprehensive Sweep

**Every Monday**
1. Run full multi-agent sweep
2. Review all new bugs with team
3. Prioritize for sprint
4. Assign to team members
```

## Step 6: Create Shortcuts (Optional)

### VS Code Tasks

Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Bug Sweep - Security",
      "type": "shell",
      "command": "echo 'Copy the security sweep command from quick-start-guide.md to Claude Code'"
    },
    {
      "label": "Bug Sweep - Full",
      "type": "shell",
      "command": "echo 'Copy the comprehensive sweep command from quick-start-guide.md to Claude Code'"
    }
  ]
}
```

### Git Hooks

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
echo "🔍 Remember to run bug detection before committing!"
echo "Use Claude Code with commands from docs/bugs/quick-start-guide.md"
```

## Step 7: Monitor and Improve

### Track Metrics
- Number of bugs found per week
- Time to fix bugs
- Most common bug types
- Components with most issues

### Refine Patterns
- Add new patterns as you discover common issues
- Remove patterns that generate false positives
- Adjust severity levels based on impact

### Team Feedback
- Collect feedback on bug report quality
- Adjust templates for clarity
- Improve workflow efficiency

## Common Setup Issues

### Issue: Claude Code can't find files
**Solution**: Ensure you're running Claude Code from your project root

### Issue: Too many false positives
**Solution**: Refine grep patterns to be more specific

### Issue: Missing bug categories
**Solution**: Add project-specific categories to templates

### Issue: Unclear bug reports
**Solution**: Enhance the bug report template with more sections

## Next Steps

1. ✅ Run your first security sweep using [quick-start-guide.md](./quick-start-guide.md)
2. 📚 Read [claude-code-usage.md](./workflows/claude-code-usage.md) for detailed workflows
3. 🎯 Try single-agent mode with [single-agent-workflow.md](./workflows/single-agent-workflow.md)
4. 🚀 Explore multi-agent mode with [multi-agent-workflow.md](./workflows/multi-agent-workflow.md)

## Maintenance Checklist

- [ ] Weekly: Review and update bug patterns
- [ ] Monthly: Analyze bug trends and adjust workflows  
- [ ] Quarterly: Major review of detection effectiveness
- [ ] Ongoing: Add new patterns as codebase evolves

---

*Congratulations! Your bug detection system is ready. Start with the [quick-start-guide.md](./quick-start-guide.md) for immediate bug detection.*