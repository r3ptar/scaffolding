# Bug Detection System Scaffolding

**Version**: 1.0.0  
**Last Updated**: June 23, 2025  
**Purpose**: Ready-to-use bug detection system for any project

## Overview

This is a complete bug detection system designed to work with Claude Code. It provides both single-agent and multi-agent workflows for comprehensive bug detection using markdown-based documentation and Claude Code's native tools.

## What's Included

```
bug-detection-system/
├── README.md                    # This file
├── SETUP_GUIDE.md              # Step-by-step setup instructions
├── quick-start-guide.md        # Copy-paste commands to get started
├── agent-specializations.md    # Agent expertise definitions
├── workflows/
│   ├── single-agent-workflow.md    # Single-agent mode documentation
│   ├── multi-agent-workflow.md     # Multi-agent mode documentation
│   └── claude-code-usage.md        # How to use with Claude Code
└── templates/
    ├── bug-report-template.md      # Template for bug reports
    ├── review-checklist.md         # Bug review checklist
    └── workflow-guide.md           # Complete workflow guide
```

## Key Features

### 🎯 Single-Agent Mode
- Quick, focused bug detection
- Individual file analysis
- Rapid pre-commit checks
- Component-specific sweeps

### 🚀 Multi-Agent Mode  
- 6 specialized agents working in parallel
- Comprehensive codebase analysis
- Expert-level detection by domain
- Efficient token usage through coordination

### 📋 Bug Tracking
- Markdown-based bug reports
- Severity-based organization
- Component categorization
- Progress tracking

### 🔍 Specialized Agents
1. **Authentication Specialist** - Auth flows, security, wallet integration
2. **Competition Specialist** - Business logic, scoring, judging
3. **Mobile & UI Specialist** - Responsive design, touch interactions
4. **Performance Specialist** - Speed, optimization, memory management
5. **Security Specialist** - Vulnerabilities, data protection
6. **Integration Specialist** - APIs, external services, data flow

## Quick Start

1. Copy this folder to your project's `docs/` directory
2. Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for initial configuration
3. Use commands from [quick-start-guide.md](./quick-start-guide.md) with Claude Code
4. Start detecting bugs immediately!

## Usage with Claude Code

Simply paste these commands into Claude Code:

### Quick Security Sweep
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

### Component-Specific Check
```
Please check the [component name] system for bugs:

1. Use Grep to find files containing: "[relevant keywords]"
2. Read the key files (especially in [relevant directories])
3. Look for these specific patterns:
   - [Pattern 1]
   - [Pattern 2]
   - [Pattern 3]
4. Create detailed bug reports for any issues found
5. Add them to docs/bugs/BUG_INDEX.md under appropriate severity levels
```

## Customization

### Adapting to Your Project

1. **Update Component Categories** in templates to match your project structure
2. **Modify Agent Specializations** to fit your technology stack
3. **Adjust Bug Patterns** in workflows for your specific needs
4. **Customize Severity Levels** based on your priorities

### Adding New Bug Patterns

Edit the workflow files to include patterns specific to your codebase:
- Authentication patterns for your auth system
- API patterns for your backend framework
- UI patterns for your component library
- Performance patterns for your architecture

## Integration

This system integrates seamlessly with:
- Git workflows (pre-commit, CI/CD)
- Team processes (standups, sprint planning)
- Documentation systems
- Issue tracking platforms

## Support

This scaffolding is based on a production-tested bug detection system. For questions or improvements, refer to the detailed documentation in each file.

---

*Ready to improve your code quality? Start with the [SETUP_GUIDE.md](./SETUP_GUIDE.md)!*