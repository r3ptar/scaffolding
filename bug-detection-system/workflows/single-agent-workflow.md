# Single-Agent Bug Detection Workflow

**Version**: 1.0.0  
**Last Updated**: June 23, 2025  
**Target Audience**: Individual developers, quick bug sweeps, focused analysis

## Overview

The single-agent workflow provides a streamlined approach to bug detection when you need:
- Quick, focused bug scanning
- Individual developer analysis
- Targeted component inspection
- Simple, straightforward bug hunting

This workflow uses the core bug detection system but runs in a simplified, sequential mode that's perfect for individual use or when you want to maintain direct control over the process.

---

## When to Use Single-Agent Mode

### ✅ Ideal Scenarios
- **Individual Development**: When working alone on specific features
- **Quick Scans**: Fast bug detection before committing code
- **Component Focus**: Analyzing specific parts of the codebase
- **Learning/Training**: Understanding the bug detection patterns
- **Small Changes**: After making focused code changes
- **Pre-commit Checks**: Quick validation before submitting PRs

### ❌ When to Use Multi-Agent Instead
- **Full Codebase Sweeps**: Comprehensive analysis of entire project
- **Team Coordination**: When multiple people need to work simultaneously
- **Large-Scale Analysis**: Processing hundreds of files efficiently
- **Specialized Expertise**: When you need different expert perspectives
- **Time-Critical Sweeps**: When speed through parallelization matters

---

## Quick Start Guide

### Prerequisites

```bash
# Ensure you're in the project root
cd /path/to/your/project

# Verify bug tracking system exists
ls docs/bugs/BUG_INDEX.md
```

### Basic Usage

```typescript
// Import the single-agent utilities
import { bugAgentCore } from '@/utils/bugAgentCore';
import { bugCoordinator } from '@/utils/bugCoordinator';

// Run a basic single-agent sweep
const sweepId = await bugCoordinator.startBugSweep({
  mode: 'single',
  priority: 'all' // or 'critical', 'high', 'medium', 'low'
});

// Monitor progress
const progress = bugCoordinator.getSweepProgress(sweepId);
console.log(`Progress: ${progress?.completedFiles}/${progress?.totalFiles} files`);
```

### Command Line Interface

Create this script as `scripts/bug-sweep-single.js`:

```javascript
#!/usr/bin/env node

const { bugCoordinator } = require('../utils/bugCoordinator');

async function runSingleAgentSweep() {
  const args = process.argv.slice(2);
  const priority = args[0] || 'all';
  const components = args.slice(1);

  console.log('🔍 Starting single-agent bug sweep...');
  
  const config = {
    mode: 'single',
    priority: priority === 'all' ? 'all' : priority,
    targetComponents: components.length > 0 ? components : undefined
  };

  try {
    const sweepId = await bugCoordinator.startBugSweep(config);
    
    // Monitor progress
    const checkProgress = () => {
      const progress = bugCoordinator.getSweepProgress(sweepId);
      if (progress) {
        console.log(`📊 ${progress.completedFiles}/${progress.totalFiles} files, ${progress.bugsFound} bugs found`);
        
        if (progress.status === 'completed') {
          console.log('✅ Sweep completed!');
          console.log(bugCoordinator.generateSweepReport(sweepId));
        } else if (progress.status === 'failed') {
          console.log('❌ Sweep failed:', progress.errors);
        } else {
          setTimeout(checkProgress, 2000);
        }
      }
    };
    
    checkProgress();
  } catch (error) {
    console.error('❌ Sweep failed:', error);
  }
}

runSingleAgentSweep();
```

Make it executable:
```bash
chmod +x scripts/bug-sweep-single.js
```

Usage:
```bash
# Basic sweep (all priorities, all components)
node scripts/bug-sweep-single.js

# High priority only
node scripts/bug-sweep-single.js high

# Specific components
node scripts/bug-sweep-single.js medium "Authentication & Auth Flow" "Competition System"

# Critical issues only
node scripts/bug-sweep-single.js critical
```

---

## Detailed Configuration Options

### Priority Filtering

```typescript
const config: BugSweepConfig = {
  mode: 'single',
  priority: 'high', // 'critical' | 'high' | 'medium' | 'low' | 'all'
};
```

**Priority Levels:**
- **Critical**: Security issues, data loss, system breakage
- **High**: Major functionality broken, significant user impact
- **Medium**: Moderate impact with workarounds available
- **Low**: Minor issues, cosmetic problems
- **All**: Detect all severities (default)

### Component Targeting

```typescript
const config: BugSweepConfig = {
  mode: 'single',
  targetComponents: [
    'Authentication & Auth Flow',
    'Competition System'
  ]
};
```

**Available Components:**
- `Authentication & Auth Flow`
- `Competition System`
- `Strain Management`
- `Mobile Interface`
- `API/Backend`
- `UI/Navigation`
- `Performance`
- `Security`
- `Notifications`
- `Inventory Management`
- `Moon Calendar`
- `Genetic Mapping`
- `Marketplace`
- `Web3 Integration`

### Timeout Configuration

```typescript
const config: BugSweepConfig = {
  mode: 'single',
  timeoutMinutes: 15, // Maximum time for the sweep
  maxTokensPerAgent: 50000 // Token budget
};
```

---

## Step-by-Step Process

### Phase 1: Initialization

1. **File Discovery**
   ```typescript
   const files = await bugAgentCore.getRelevantFiles();
   console.log(`Found ${files.length} files to analyze`);
   ```

2. **Segmentation**
   ```typescript
   const segments = await bugAgentCore.createFileSegments(files);
   console.log(`Created ${segments.length} analysis segments`);
   ```

3. **Priority Sorting**
   - High priority: Auth, API routes, critical components
   - Medium priority: Components, hooks, business logic
   - Low priority: Utilities, types, configuration

### Phase 2: Analysis

4. **Pattern Matching**
   - Authentication loops
   - Mobile responsiveness issues
   - Unhandled error cases
   - Memory leaks
   - Security vulnerabilities
   - Performance issues
   - Competition logic errors

5. **False Positive Filtering**
   - Skip commented code with mobile keywords
   - Ignore test files
   - Filter out intended behavior

6. **Confidence Scoring**
   - Pattern specificity
   - Code context
   - Severity level
   - Match characteristics

### Phase 3: Reporting

7. **Bug Report Generation**
   - Create detailed markdown reports
   - Include code snippets and context
   - Suggest fixes and workarounds
   - Add to main bug index

8. **Integration**
   - Update `BUG_INDEX.md`
   - Create individual bug files in `active/`
   - Update metrics and counters

---

## Monitoring and Progress

### Real-time Monitoring

```typescript
// Get current progress
const progress = bugCoordinator.getSweepProgress(sweepId);

if (progress) {
  console.log(`
📊 Single-Agent Sweep Progress
Status: ${progress.status}
Files: ${progress.completedFiles}/${progress.totalFiles}
Bugs Found: ${progress.bugsFound}
Errors: ${progress.errors.length}
  `);
}
```

### Progress Indicators

- **Initializing**: Setting up file discovery and segmentation
- **Running**: Actively analyzing files and detecting bugs
- **Completed**: Analysis finished, reports generated
- **Failed**: Error encountered, check error messages

### Performance Metrics

```typescript
// Generate detailed report
const report = bugCoordinator.generateSweepReport(sweepId);
console.log(report);
```

**Typical Performance:**
- **Small projects** (50-100 files): 2-5 minutes
- **Medium projects** (200-500 files): 5-15 minutes
- **Large projects** (500+ files): 15-30 minutes

---

## Advanced Usage Patterns

### Targeted Analysis After Code Changes

```typescript
// Analyze only files modified in last commit
const modifiedFiles = execSync('git diff --name-only HEAD~1 HEAD')
  .toString()
  .split('\n')
  .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));

const config = {
  mode: 'single',
  priority: 'high',
  // Custom file list (implementation needed)
  customFiles: modifiedFiles
};
```

### Pre-commit Hook Integration

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh

echo "🔍 Running bug detection on staged files..."

# Run single-agent sweep on high priority issues
node scripts/bug-sweep-single.js high

# Check if any critical bugs were found
CRITICAL_BUGS=$(grep -c "🔴.*Critical" docs/bugs/BUG_INDEX.md || echo "0")

if [ "$CRITICAL_BUGS" -gt "0" ]; then
  echo "❌ Critical bugs detected! Please fix before committing."
  exit 1
fi

echo "✅ No critical bugs detected."
```

### Component-Specific Workflows

```typescript
// Authentication focus
const authSweep = {
  mode: 'single',
  priority: 'high',
  targetComponents: ['Authentication & Auth Flow', 'Security', 'Web3 Integration']
};

// Performance focus
const perfSweep = {
  mode: 'single',
  priority: 'medium',
  targetComponents: ['Performance', 'API/Backend', 'Genetic Mapping']
};

// Mobile focus
const mobileSweep = {
  mode: 'single',
  priority: 'all',
  targetComponents: ['Mobile Interface', 'UI/Navigation']
};
```

---

## Integration with Development Workflow

### IDE Integration

**VS Code Extension** (conceptual):
```json
{
  "name": "tokebook-bug-sweep",
  "commands": [
    {
      "command": "tokebook.bugSweep",
      "title": "Run Bug Sweep (Single Agent)"
    }
  ]
}
```

### CI/CD Integration

```yaml
# .github/workflows/bug-detection.yml
name: Bug Detection

on:
  pull_request:
    branches: [ main ]

jobs:
  bug-sweep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: node scripts/bug-sweep-single.js high
      
      - name: Check for critical bugs
        run: |
          if grep -q "🔴.*Critical.*Open" docs/bugs/BUG_INDEX.md; then
            echo "Critical bugs detected!"
            exit 1
          fi
```

### Team Workflow Integration

1. **Code Review Process**
   ```bash
   # Before creating PR
   node scripts/bug-sweep-single.js high
   ```

2. **Daily Development**
   ```bash
   # After implementing new features
   node scripts/bug-sweep-single.js medium "Competition System"
   ```

3. **Release Preparation**
   ```bash
   # Comprehensive check before release
   node scripts/bug-sweep-single.js all
   ```

---

## Troubleshooting

### Common Issues

**1. No files found**
```
Solution: Ensure you're in the project root directory
Check: ls app/ components/ utils/
```

**2. Permission errors**
```
Solution: Check file permissions for docs/bugs/ directory
Fix: chmod -R 755 docs/bugs/
```

**3. Out of memory**
```
Solution: Process smaller file batches
Config: Reduce maxTokensPerAgent to 25000
```

**4. False positives**
```
Solution: Review and refine bug patterns
Action: Add false positive filters to patterns
```

### Performance Optimization

**For Large Codebases:**
```typescript
const config = {
  mode: 'single',
  maxTokensPerAgent: 25000, // Smaller batches
  priority: 'high', // Focus on important issues
  targetComponents: ['Authentication & Auth Flow'] // Specific areas
};
```

**For Fast Development:**
```typescript
const config = {
  mode: 'single',
  priority: 'critical', // Only critical issues
  timeoutMinutes: 5 // Quick scan
};
```

---

## Output Examples

### Console Output

```
🔍 Starting single-agent bug sweep (127 files)
📊 Progress: 10/127 files, 2 bugs found
📊 Progress: 20/127 files, 5 bugs found
📊 Progress: 30/127 files, 8 bugs found
...
📝 Creating bug reports for 15 issues...
✅ Created BUG-007: Authentication Loop in utils/clientAuth.ts
✅ Created BUG-008: Mobile Responsiveness Issues in components/MobileNavigation.tsx
✅ Created BUG-009: Unhandled Error Cases in app/api/competitions/route.ts
...
✨ Single-agent sweep completed: 15 bugs found and reported
```

### Generated Bug Report Example

```markdown
# BUG-007: Authentication Loop in utils/clientAuth.ts

**Status**: 🔴 Open  
**Severity**: 🟠 High  
**Component**: Authentication & Auth Flow  
**Detection**: Automated Agent Detection  
**Confidence**: 85%  
**Created**: 2025-06-23  

## Description

Potential infinite authentication loops

**Detected in**: `utils/clientAuth.ts:127`

## Technical Details

### Code Context
```typescript
useEffect(() => {
  if (user && !user.isAuthenticated) {
    authenticateUser();
  }
}, [user]); // Potential infinite loop if authenticateUser modifies user
```

## Suggested Fix

Add proper dependency array to useEffect or implement proper exit condition in auth logic

## Workaround

Clear browser storage and try different wallet or use desktop browser
```

---

## Next Steps

After completing a single-agent sweep:

1. **Review Results**: Check `docs/bugs/BUG_INDEX.md` for new bugs
2. **Prioritize Fixes**: Focus on critical and high-priority issues
3. **Assign Work**: Assign bugs to appropriate team members
4. **Track Progress**: Update bug statuses as work progresses
5. **Validate Fixes**: Run targeted sweeps after fixes

For more comprehensive analysis, consider upgrading to [Multi-Agent Workflow](./multi-agent-workflow.md).

---

*This workflow is part of the comprehensive bug management system. See [workflow-guide.md](../templates/workflow-guide.md) for integration with the overall bug tracking process.*