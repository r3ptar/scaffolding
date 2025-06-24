# Using Bug Detection System with Claude Code

**Version**: 1.0.0  
**Last Updated**: June 23, 2025  
**Purpose**: Instructions for using the bug detection system directly with Claude Code

## Overview

This guide shows how to use the dual-mode bug detection system using Claude Code's built-in tools (Read, Grep, Glob, Task) rather than JavaScript execution. Claude Code can analyze your codebase and create bug reports by following these structured workflows.

---

## Single-Agent Workflow for Claude Code

### Step 1: Initialize Bug Detection Session

**Prompt for Claude Code:**
```
I want to run a single-agent bug sweep on my codebase. Please:

1. Read the current bug index at docs/bugs/BUG_INDEX.md to understand existing bugs
2. Use Glob to find all TypeScript/JavaScript files in app/, components/, hooks/, and utils/
3. Analyze the files for the following bug patterns:
   - Authentication loops (useEffect with auth dependencies)
   - Mobile responsiveness issues (fixed widths without @media)
   - Unhandled error cases (fetch/API calls without .catch)
   - Memory leaks (event listeners without cleanup)
   - Security vulnerabilities (dangerouslySetInnerHTML, eval)
   - Performance issues (nested loops, inefficient operations)

4. Create bug reports for any issues found using the existing bug report template
5. Update the main bug index with new findings

Focus on HIGH priority issues first, then work through medium and low priority.
```

### Step 2: Component-Specific Analysis

**For Authentication Issues:**
```
Please analyze authentication-related files for bugs:

1. Use Grep to find files containing "auth", "login", "wallet", "token"
2. Read these files and look for:
   - useEffect hooks that might cause authentication loops
   - Missing error handling in auth flows
   - Wallet connection issues
   - Session management problems

3. Create detailed bug reports for any issues found
4. Add them to docs/bugs/BUG_INDEX.md under the appropriate severity section
```

**For Competition System Issues:**
```
Please analyze competition-related files for bugs:

1. Use Grep to find files containing "competition", "judge", "score", "entry"
2. Look for:
   - Scoring calculation errors
   - Missing validation in judge assignments
   - Entry submission failures
   - Leaderboard inconsistencies

3. Create bug reports and update the index
```

**For Mobile Interface Issues:**
```
Please analyze mobile and UI files for bugs:

1. Use Glob to find .tsx files in components/
2. Look for:
   - Hard-coded pixel values without responsive breakpoints
   - Missing mobile-specific handling
   - Touch interaction issues
   - Navigation problems on mobile

3. Focus on files that likely affect mobile experience
```

---

## Multi-Agent Simulation Workflow

Since Claude Code can't run multiple agents simultaneously, we simulate multi-agent coordination by having Claude Code work through specialized analysis phases:

### Phase 1: Security & Authentication Analysis

**Prompt:**
```
Act as the AUTHENTICATION & SECURITY SPECIALIST agent. Please:

1. Use Grep to find files with patterns: "auth", "login", "wallet", "session", "token", "password", "security"
2. Read and analyze these files for:
   - Authentication loops and infinite redirects
   - Wallet connection failures  
   - Session management issues
   - Security vulnerabilities (XSS, injection, insecure storage)
   - Permission and access control flaws

3. Create bug reports for issues found, focusing on CRITICAL and HIGH severity
4. Tag reports with "Agent: Authentication Specialist"
```

### Phase 2: Competition System Analysis

**Prompt:**
```
Act as the COMPETITION SYSTEM SPECIALIST agent. Please:

1. Use Grep to find files with patterns: "competition", "judge", "score", "entry", "leaderboard"
2. Analyze for:
   - Scoring calculation errors and edge cases
   - Judge assignment and verification logic
   - Entry submission validation issues
   - Competition state management problems
   - Notification system bugs

3. Create bug reports tagged with "Agent: Competition Specialist"
4. Focus on issues that could affect competition launches
```

### Phase 3: Mobile & UI Analysis

**Prompt:**
```
Act as the MOBILE & UI SPECIALIST agent. Please:

1. Use Glob to find component files: "components/**/*.{tsx,jsx}"
2. Look for:
   - Hard-coded dimensions without responsive design
   - Missing mobile-specific interactions
   - Navigation issues on small screens
   - Touch/swipe gesture problems
   - UI components that break on mobile

3. Create bug reports tagged with "Agent: Mobile Specialist"
4. Include specific mobile device scenarios in reproduction steps
```

### Phase 4: Performance Analysis

**Prompt:**
```
Act as the PERFORMANCE SPECIALIST agent. Please:

1. Use Grep to find performance-related patterns:
   - Nested loops: "for.*for"
   - Inefficient operations: "\.map.*\.map"
   - Missing memoization: "useEffect.*\[\]"
   - Memory leaks: "addEventListener.*removeEventListener"

2. Analyze large components and complex calculations
3. Focus on genetic mapping and data visualization components
4. Create bug reports tagged with "Agent: Performance Specialist"
```

### Phase 5: Integration & API Analysis

**Prompt:**
```
Act as the INTEGRATION SPECIALIST agent. Please:

1. Use Glob to find API routes: "app/api/**/*.ts"
2. Use Grep to find: "fetch", "api", "endpoint", "webhook"
3. Analyze for:
   - Missing error handling in API calls
   - Data consistency issues
   - External service integration problems
   - Database transaction errors
   - Web3/blockchain interaction bugs

4. Create bug reports tagged with "Agent: Integration Specialist"
```

---

## Bug Report Creation Template

When Claude Code finds bugs, use this format:

```markdown
# BUG-XXX: [Brief Description]

**Status**: 🔴 Open  
**Severity**: [🔴🟠🟡🟢] [Critical/High/Medium/Low]  
**Component**: [Component Category]  
**Detection**: Claude Code Analysis  
**Agent**: [Specialist Agent if using multi-agent simulation]  
**Created**: [Date]  

## Description
[Detailed description of the issue]

**Detected in**: `[file path]:[line]`

## Impact Assessment
- **User Impact**: [How users are affected]
- **Business Impact**: [Business consequences]
- **Technical Risk**: [Technical implications]

## Technical Details

### Location
- **File**: `[relative file path]`
- **Line**: [line number if applicable]
- **Component**: [component category]

### Code Context
```typescript
[Code snippet showing the issue]
```

## Reproduction Steps
1. [Step-by-step reproduction]
2. [Continue with steps]

## Expected Behavior
[What should happen]

## Actual Behavior
[What currently happens]

## Suggested Fix
[Recommended solution approach]

## Workaround
[Temporary solution if available]

## Related Files
[List of related files that might be affected]

---

**Next Review**: [Date for follow-up]  
*Generated by Claude Code Analysis*
```

---

## File Organization Commands

### Finding Files to Analyze

```
Use Glob tool with these patterns:
- "app/**/*.{ts,tsx}" - Next.js app router files
- "components/**/*.{ts,tsx}" - React components
- "hooks/**/*.{ts,tsx}" - Custom hooks
- "utils/**/*.{ts,tsx}" - Utility functions
- "types/**/*.ts" - Type definitions
```

### Searching for Bug Patterns

```
Use Grep tool with these patterns:
- "useEffect.*auth.*\[\]" - Potential auth loops
- "fetch.*\.then.*catch" - Error handling patterns
- "dangerouslySetInnerHTML" - Security risks
- "addEventListener.*removeEventListener" - Memory leak patterns
- "Math\.random.*score" - Potential scoring issues
```

### Reading Bug Index

```
Always start by reading: docs/bugs/BUG_INDEX.md
This shows current bug status and prevents duplicate reporting
```

---

## Workflow Commands for Claude Code

### Quick Security Sweep
```
Please run a security-focused bug sweep:

1. Read docs/bugs/BUG_INDEX.md to see current security bugs
2. Use Grep to find files with security-sensitive patterns:
   - "dangerouslySetInnerHTML"
   - "eval\("
   - "innerHTML\s*="
   - "document\.write"
3. Read those files and analyze for security vulnerabilities
4. Create bug reports for any critical or high-severity issues found
5. Update the bug index with new security bugs
```

### Mobile Responsiveness Check
```
Please check for mobile responsiveness issues:

1. Use Glob to find all component files: "components/**/*.{tsx,jsx}"
2. Read each file and look for:
   - Hard-coded pixel values: "width.*px"
   - Missing responsive classes
   - Fixed positioning without mobile considerations
3. Create bug reports for mobile issues
4. Focus on navigation and key user interaction components
```

### Competition System Validation
```
Please validate the competition system for bugs:

1. Use Grep to find competition files: "competition|judge|score|entry"
2. Read the core competition logic files
3. Look for:
   - Mathematical errors in scoring
   - Missing validation in judge flows
   - Entry submission edge cases
   - State management issues
4. Create detailed bug reports for competition-blocking issues
```

---

## Integration with Existing Bug System

### Reading Current Status
```
Before starting any bug detection:
1. Read docs/bugs/BUG_INDEX.md to understand current bug count and priorities
2. Read docs/bugs/README.md to understand the workflow
3. Check docs/bugs/active/ directory to see what's already being worked on
```

### Creating New Bug Reports
```
When creating bug reports:
1. Get the next bug ID by checking the highest BUG-XXX number in BUG_INDEX.md
2. Create the bug report file in docs/bugs/active/
3. Update docs/bugs/BUG_INDEX.md with the new bug entry
4. Follow the existing severity and component categorization
```

### Updating Bug Index
```
When adding bugs to BUG_INDEX.md:
1. Add to the appropriate severity section (Critical/High/Medium/Low)
2. Update the metrics section with new counts
3. Maintain the existing format and structure
4. Include file references and brief descriptions
```

---

## Sample Commands for Different Scenarios

### Pre-Commit Bug Check
```
I'm about to commit code changes. Please run a quick bug check:

1. Use Git commands to see which files changed: git diff --name-only HEAD
2. Read those specific files
3. Look for common bug patterns in the changed code
4. Report any potential issues before I commit
5. Focus on critical and high severity issues only
```

### New Feature Bug Sweep
```
I just implemented a new [feature name]. Please sweep for bugs:

1. Focus on files related to [feature area]
2. Look for integration issues with existing systems
3. Check for edge cases and error handling
4. Validate security and performance implications
5. Create bug reports for any issues found
```

### Release Readiness Check
```
We're preparing for a release. Please run a comprehensive bug sweep:

1. Start with critical security issues
2. Check all competition-related functionality 
3. Validate mobile responsiveness
4. Review API error handling
5. Generate a summary of bugs that should block the release
```

---

## Expected Outputs

When following these workflows, Claude Code will:

1. **Analyze** your codebase systematically using built-in tools
2. **Identify** potential bugs using pattern matching and code analysis
3. **Create** detailed bug reports following your existing template system
4. **Update** the main bug index with new findings
5. **Organize** bugs by severity and component area
6. **Provide** actionable recommendations for fixes

The system integrates seamlessly with your existing markdown-based bug tracking and can be run regularly to maintain code quality.

---

*This workflow leverages Claude Code's native capabilities without requiring any JavaScript execution or external tools.*