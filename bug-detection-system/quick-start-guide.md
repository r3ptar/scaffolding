# Bug Detection Quick Start Guide

**Version**: 1.0.0  
**Last Updated**: June 23, 2025  
**Purpose**: Get started with bug detection using Claude Code

## 🚀 Quick Start Commands

Copy and paste these commands directly into Claude Code to start bug detection:

### Option 1: Quick Security Sweep (Recommended First Run)

```
Please run a security-focused bug sweep on my codebase:

1. Read docs/bugs/BUG_INDEX.md to see current status
2. Use Grep to find security-sensitive patterns in TypeScript files:
   - "dangerouslySetInnerHTML"
   - "eval\("
   - "innerHTML\s*="
   - "\$\{.*req\."
3. Read any files found and analyze for security vulnerabilities
4. Create bug reports using the template in docs/bugs/templates/bug-report-template.md
5. Update docs/bugs/BUG_INDEX.md with any critical or high-severity security issues found

Focus on critical security vulnerabilities that could affect user data or authentication.
```

### Option 2: Authentication System Check

```
Please check the authentication system for bugs:

1. Use Grep to find files containing: "auth|login|wallet|token|session"
2. Read the key authentication files (especially in utils/, hooks/, and app/api/)
3. Look for these specific patterns:
   - useEffect hooks with auth dependencies that could cause loops
   - Missing error handling in wallet connection flows
   - Insecure token storage or session management
   - Authentication bypass vulnerabilities
4. Create detailed bug reports for any issues found
5. Add them to docs/bugs/BUG_INDEX.md under appropriate severity levels

This is critical for our wallet-based authentication system.
```

### Option 3: Competition System Validation

```
Please validate our competition system for bugs before launch:

1. Use Grep to find files with: "competition|judge|score|entry|leaderboard"
2. Read the core competition logic files
3. Analyze for these competition-specific issues:
   - Scoring calculation errors or division by zero
   - Missing validation in judge assignment flows
   - Entry submission edge cases and error handling
   - Competition state management problems
   - Bulk approval/rejection functionality issues
4. Create bug reports focusing on issues that could block competition launch
5. Update the bug index with findings

Focus on high-severity issues that could affect competition integrity.
```

### Option 4: Mobile Responsiveness Check

```
Please check for mobile responsiveness issues:

1. Use Glob to find React component files: "components/**/*.{tsx,jsx}"
2. Read components that likely affect mobile users (navigation, forms, key interactions)
3. Look for these mobile issues:
   - Hard-coded pixel values without responsive breakpoints
   - Fixed positioning that breaks on mobile
   - Missing touch/swipe gesture handling
   - UI components that don't work on small screens
4. Create bug reports for mobile interface issues
5. Focus on components critical for mobile user experience

Our mobile users are experiencing issues, so this is high priority.
```

## 📋 Step-by-Step First Bug Sweep

### Step 1: Check Current Status
```
Please read docs/bugs/BUG_INDEX.md and give me a summary of:
- How many active bugs we currently have
- What severity levels they are
- Which components have the most issues
- Any critical bugs that need immediate attention
```

### Step 2: Run Targeted Analysis
Choose one of the Quick Start commands above based on your priorities:
- **Security issues** → Use Security Sweep
- **Authentication problems** → Use Authentication Check  
- **Competition launch prep** → Use Competition Validation
- **Mobile user complaints** → Use Mobile Check

### Step 3: Review and Prioritize
```
After finding bugs, please:
1. Show me a summary of new bugs found
2. Highlight any critical or high-severity issues
3. Suggest which bugs should be fixed first
4. Identify any patterns in the bugs that suggest broader issues
```

## 🎯 Common Bug Patterns to Look For

When Claude Code analyzes your files, it should focus on these patterns:

### Authentication Issues
- `useEffect(() => { if (user) authenticate(); }, [user])` - Potential loops
- `localStorage.setItem('token', token)` - Insecure storage
- Missing error handling in wallet connections
- Authentication bypass opportunities

### Competition System Issues  
- `score / entries.length` without checking for zero entries
- Missing validation before judge assignments
- API calls without error handling in competition flows
- State management issues in competition lifecycle

### Mobile Interface Issues
- `width: 300px` without responsive design
- `position: fixed` without mobile considerations
- Missing `@media` queries for breakpoints
- Hard-coded dimensions that break on small screens

### Security Vulnerabilities
- `dangerouslySetInnerHTML={{__html: userContent}}` - XSS risk
- `eval(userInput)` - Code injection risk
- Missing input validation on user data
- Insecure API endpoint implementations

### Performance Issues
- Nested loops without optimization
- Missing `useMemo` or `useCallback` for expensive operations
- Large bundle imports that could be lazy-loaded
- Memory leaks from event listeners

## 📊 What to Expect

After running a bug sweep, you should get:

1. **Bug Reports** - Detailed markdown files in `docs/bugs/active/`
2. **Updated Index** - `docs/bugs/BUG_INDEX.md` with new bug counts
3. **Priority Assessment** - Clear indication of what needs immediate attention
4. **Fix Recommendations** - Suggested approaches for resolving each bug

## 🔄 Regular Usage Patterns

### Daily Development
```
I just finished implementing [feature]. Please check for bugs in the files I modified:
[List the files you changed]

Focus on integration issues and common bug patterns.
```

### Pre-Commit Check
```
Before I commit, please do a quick bug check on my staged changes:
1. Use git diff to see what changed
2. Read the modified files
3. Look for obvious bugs or issues
4. Report anything that should be fixed before committing
```

### Weekly Team Review
```
Please run a comprehensive bug sweep for our weekly review:
1. Check all major system components
2. Focus on critical and high-severity issues
3. Generate a summary for the team meeting
4. Highlight any trends or patterns in bugs found
```

### Pre-Release Validation
```
We're preparing for release. Please run a comprehensive validation:
1. Security sweep for any critical vulnerabilities
2. Competition system validation for launch readiness
3. Mobile interface check for user experience
4. Integration testing for API and external services
5. Provide a release readiness assessment
```

## 🛠️ Customizing Bug Detection

### Focus on Specific Components
```
Please focus bug detection on [component name]:
1. Use Grep to find files related to [specific functionality]
2. Look for [specific issues you're concerned about]
3. Create targeted bug reports
```

### Adjust Severity Focus
```
Please run a [critical/high/medium/low] severity bug sweep:
- Only report bugs at this severity level or higher
- Focus on [specific areas of concern]
- Prioritize [business-critical functionality]
```

### Target Specific File Types
```
Please analyze [TypeScript/React/API] files specifically:
- Use appropriate Glob patterns for file types
- Look for [language/framework-specific issues]
- Apply [relevant coding standards]
```

## 📈 Tracking Progress

### View Bug Trends
```
Please analyze our bug trends:
1. Read the bug index and recent bug reports
2. Identify patterns in bug types and locations
3. Suggest areas that need more attention
4. Recommend process improvements
```

### Validate Bug Fixes
```
I fixed bugs BUG-XXX, BUG-YYY, BUG-ZZZ. Please:
1. Read the files that were fixed
2. Verify the issues are resolved
3. Check for any regressions introduced
4. Update bug statuses if fixes are confirmed
```

## 🚨 Emergency Bug Detection

For critical situations:

```
URGENT: We have reports of [critical issue]. Please:
1. Immediately scan for [specific problem type]
2. Focus only on critical and high-severity issues
3. Provide rapid assessment of scope and impact
4. Suggest immediate mitigation steps
5. Create emergency bug reports for tracking
```

---

**💡 Pro Tip**: Start with the Security Sweep - it's quick and catches the most critical issues first. Then move to component-specific sweeps based on your current priorities.

**🔗 Next Steps**: After your first bug sweep, check out the detailed [Single-Agent Workflow](./single-agent-workflow.md) and [Multi-Agent Workflow](./multi-agent-workflow.md) guides for advanced usage patterns.