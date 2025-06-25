# [Project Name] - AI Agent Context

## 🤝 Multi-Agent Sprint Workflow

### 📦 Simple Context Handoff System ✅ **WORKING**
**IMPORTANT**: Use these simple scripts for context management between sessions!

**Create a handoff when:**
1. **Task Completed**: Before starting new task
2. **Context > 70%**: When approaching token limits
3. **Major Context Switch**: Moving to different part of codebase
4. **End of Session**: Always create handoff before stopping

**Quick Setup:**
```bash
# Copy scripts from scaffolding (one-time setup)
cp docs/scaffolding/context-handoff/*.sh .
chmod +x *.sh
```

**Quick Commands:**
```bash
# Create handoff with current task description
./quick-handoff.sh "working on [current task description]"

# Restore context from previous session
./restore-context.sh handoff-[YYYY-MM-DD_HHMMSS].md

# List available handoffs
./restore-context.sh
```

**What gets preserved:**
- Current task description
- All git status (uncommitted, staged files)
- Recent commits and current branch
- Environment info (Node version, platform)
- Active services status

## 📂 MANDATORY: Sprint Documentation System

**CRITICAL**: ALL sprint work MUST use the `docs/sprints/` documentation system:

### Required Sprint Structure
```
docs/sprints/sprint-[#]/
├── README.md                    # Sprint overview, goals, success criteria
├── agent-1-[role].md           # Agent 1 detailed tasks and progress
├── agent-2-[role].md           # Agent 2 detailed tasks and progress  
├── agent-3-[role].md           # Agent 3 detailed tasks and progress
├── agent-4-[role].md           # Agent 4 detailed tasks and progress
├── agent-5-[role].md           # Agent 5 detailed tasks and progress
├── agent-6-[role].md           # Agent 6 detailed tasks and progress
├── implementation-guide.md      # Technical architecture
└── [feature-name].md           # Feature-specific documentation
```

### What Goes Where:
- **CLAUDE.md**: Only sprint status summary, critical blockers, confidence matrix
- **docs/sprints/sprint-[#]/**: ALL detailed tasks, implementation notes, progress tracking
- **Agent Files**: Individual task breakdowns, technical decisions, testing notes
- **Feature Files**: Deep-dive documentation for complex features

### Agent Responsibilities:
1. **ALWAYS** check `docs/sprints/sprint-[#]/README.md` for current sprint goals
2. **ALWAYS** maintain your `agent-[#]-[role].md` file with detailed progress
3. **NEVER** put detailed implementation notes in CLAUDE.md
4. **REFERENCE** sprint docs when reporting status in CLAUDE.md

**Example**: Instead of writing detailed tasks in CLAUDE.md, write:
```
✅ [Agent1-Backend]: API endpoints complete - 🟢 High - TEST:PASS - See docs/sprints/sprint-[#]/agent-1-backend.md for details - [Date]
```

### Active Sprint Status
**Sprint #**: [Current Sprint Number]  
**Sprint Duration**: [Duration]  
**Agents Active**: [Number]  
**Sprint Goal**: [Brief description of sprint objective]

### Sprint Completed Tasks
<!-- Each agent should update this section when completing a task -->
<!-- Format: ✅ [Agent#-Role]: Task - Confidence - Test Status - Details - Date -->
<!-- AUTO-COMPACT: When >10 tasks OR sprint ends, move to Sprint History -->

**Task Count**: 0/[Total] (Sprint #[Number] - [Sprint Name])

## 🏗️ Architecture Review Status

### Current Review Cycle: [YYYY-MM]
**Status**: 🔴 Not Started | 🟡 In Progress | 🟢 Complete  
**Focus**: [Define focus areas for this review cycle]

### Critical Architecture Findings
| Finding | Severity | Impact | Status |
|---------|----------|--------|--------|
| [Add findings as they're discovered] | 🔴 Critical | [Impact description] | Awaiting decision |

### Architecture Decisions Pending
1. **[Decision Topic]** - See [ADR-XXX](docs/architecture/review-[YYYY-MM]/decisions/ADR-XXX-topic.md)
2. **[Decision Topic]** - See [ADR-XXX](docs/architecture/review-[YYYY-MM]/decisions/ADR-XXX-topic.md)

**📊 Full Architecture Reports**: [docs/architecture/review-[YYYY-MM]/](docs/architecture/review-[YYYY-MM]/)  
**🔍 Latest Reports**: [Comprehensive Report](docs/architecture/review-[YYYY-MM]/COMPREHENSIVE_ARCHITECTURE_REPORT.md) | [Tech Debt](docs/architecture/review-[YYYY-MM]/reports/tech-debt.md) | [Performance Hotspots](docs/architecture/review-[YYYY-MM]/reports/performance-hotspots.md)

### Sprint Issues & Blockers
<!-- Log any issues encountered during the sprint -->

### Error Pattern Log
<!-- Track recurring issues to prevent repeated debugging -->
| Pattern | Frequency | Solution | Prevention |
|---------|-----------|----------|------------|
| [Error type] | [# times] | [Fix] | [How to avoid] |

### Agent Confidence Matrix
<!-- Agents rate their deliverables so you know what needs review -->
| Feature | Agent | Confidence | Needs Your Review? | Notes |
|---------|-------|------------|-------------------|-------|
| [Feature name] | [Agent] | 🔴/🟡/🟢 | Yes/No | [Notes] |

## 🧪 Agent Self-Testing Protocol
<!-- Each agent MUST complete before marking task done -->

### Pre-Commit Checklist
Every agent must verify:
- [ ] Code builds without errors: `npm run build` (or equivalent)
- [ ] Tests pass: `npm test` (or equivalent)
- [ ] No console errors in browser/runtime
- [ ] Linting passes: `npm run lint` (or equivalent)
- [ ] Integration tested with dependent features
- [ ] Confidence level assigned (🟢🟡🔴)
- [ ] Bug sweep completed on changed files (see Bug Detection below)

### Quick Validation Commands
```bash
# 1. System Health (customize for your stack)
[health check commands for your project]

# 2. Critical Feature Test
[test commands for core functionality]

# 3. Quick Integration Check
[integration test commands]

# 4. Code Quality Check
[linting/type checking commands]
```

## 🐛 Bug Detection System
**MANDATORY**: All agents must check for bugs before committing code!

### Quick Bug Check (Before Every Commit)
```
Please check for bugs in the files I just modified:
1. Read docs/bugs/BUG_INDEX.md to see existing bugs
2. Use git diff to see what I changed
3. Read the modified files looking for bug patterns
4. If bugs found, create reports in docs/bugs/active/
5. Update docs/bugs/BUG_INDEX.md with any new bugs
```

### Component-Specific Bug Sweeps
Use these based on what you're working on:

**Backend/API Work:**
```
Please check the API routes for bugs:
1. Use Grep to find files with: "route|endpoint|api|middleware"
2. Look for: missing auth checks, unvalidated inputs, error handling
3. Check my recent changes in [api directory]
4. Report any security or reliability issues
```

**Frontend Work:**
```
Please check [Frontend Framework] components for bugs:
1. Use Grep to find files with: "useState|useEffect|component" (or framework equivalent)
2. Look for: hook violations, missing error boundaries, state issues
3. Focus on files I modified in [frontend directory]
4. Report any UI or state management bugs
```

**Database Work:**
```
Please check database code for bugs:
1. Use Grep to find: "query|select|insert|update|migration"
2. Look for: missing validation, SQL injection risks, migration issues
3. Review migration files and query patterns
4. Report any data integrity or performance issues
```

### Bug Severity Guidelines
- **🔴 Critical**: Log immediately, fix before continuing
- **🟠 High**: Log and plan to fix in current sprint
- **🟡 Medium**: Log for next sprint consideration
- **🟢 Low**: Log for future improvement

## 🚀 Quick Start

### Environment Health Check
```bash
# Customize these commands for your project
[command to check if services are running]
[command to verify database connection]
[command to test main functionality]
```

### Start Development
```bash
# Customize these commands for your project
[commands to start development environment]
[commands to run in development mode]
[commands to check logs if issues occur]
```

### Current Priority: [Current Development Focus]
1. **[Priority 1]** - [Description]
2. **[Priority 2]** - [Description]  
3. **[Priority 3]** - [Description]

## 📋 Sprint Management Protocol

### Pre-Sprint Setup (For Sprint Leader)
1. **FIRST**: Create `docs/sprints/sprint-[#]/README.md` with sprint goals
2. **SECOND**: Create agent files: `docs/sprints/sprint-[#]/agent-[#]-[role].md` 
3. Update Sprint # and Goal in CLAUDE.md (summary only)
4. Assign each agent to a focus area
5. Ensure all agents read their respective agent files before starting

**MANDATORY**: All detailed sprint planning goes in `docs/sprints/sprint-[#]/` - NOT in CLAUDE.md

### During Sprint (All Agents)
1. **Update your status** in the Agent Assignments table
2. **Log completed tasks** with timestamp in Sprint Completed Tasks
3. **Report blockers immediately** in Sprint Issues & Blockers
4. **Commit frequently** with descriptive messages
5. **Test your changes** before marking complete

### Sprint Communication Rules
- **Standardized Commit Format**: `[Agent#-Role] type(scope): description - TEST:STATUS - BUGS:COUNT`
  - Examples:
    - `[Agent1-Backend] feat(api): add user endpoint - TEST:PASS - BUGS:0`
    - `[Agent2-Frontend] fix(ui): resolve state sync - TEST:FAIL-FIXED - BUGS:2`
    - `[Agent3-Database] chore(migration): add tables - TEST:N/A - BUGS:1`
- **CRITICAL**: ALL detailed work goes in `docs/sprints/sprint-[#]/agent-[#]-[role].md`
- **CLAUDE.md Updates**: Only brief status summaries with reference to sprint docs
- **Format for CLAUDE.md**: `✅ [Agent#-Role]: Brief task - Confidence - TEST:STATUS - See docs/sprints/sprint-[#]/agent-[#]-[role].md for details - Date`
- **Log all bugs** in `docs/bugs/` using the bug detection system
- **Document breaking changes** in your agent file AND CLAUDE.md
- **Log confidence level** in completed tasks (🟢🟡🔴)
- **Manage chat context** - start new chat when switching tasks
- **Keep CLAUDE.md clean** - detailed progress goes in sprint docs

## 🎯 Agent Role Definitions

### Agent 1: Backend Lead
- API endpoint implementation
- Database migrations
- Service layer logic
- Performance optimization

### Agent 2: Frontend Lead  
- [Frontend Framework] component development
- UI/UX implementation
- State management
- Visual polish

### Agent 3: Database Architect
- Schema design
- Migration scripts
- Query optimization
- Data integrity

### Agent 4: QA Engineer
- Test suite development
- Bug identification and tracking
- Performance testing
- Integration testing
- **Primary bug detection responsibility**
- Weekly comprehensive bug sweeps

### Agent 5: Integration Specialist
- Frontend-backend connection
- External service integration
- Real-time features
- Third-party APIs

### Agent 6: DevOps & Documentation
- Deployment scripts
- Monitoring setup
- Documentation updates
- Sprint reports

## 🎯 Specialized Agent Profiles (Optional)

### Agent 7: Security & Compliance Specialist
- Security audits and vulnerability assessment
- Authentication/authorization systems
- Data protection and privacy compliance
- Security testing and penetration testing
- Monitoring security logs and incident response

### Agent 8: UX/UI Designer & Accessibility
- User experience research and design
- Accessibility compliance (WCAG, ARIA)
- Visual design and branding consistency
- User journey optimization
- A/B testing and user feedback analysis

### Agent 9: Data Scientist & Analytics
- Business metrics analysis
- User behavior analytics
- Performance monitoring and optimization
- Machine learning model integration
- Business intelligence and reporting

### Agent 10: Mobile & Platform Specialist
- Mobile app development
- Cross-platform compatibility
- Device-specific optimizations
- App store deployment and maintenance
- Platform-specific integrations

### Agent 11: AI/LLM Integration Specialist
- AI model integration and optimization
- Prompt engineering and fine-tuning
- Natural language processing enhancements
- AI-driven feature development
- Model performance monitoring

### Agent 12: Infrastructure & Scaling
- Cloud infrastructure management
- Container orchestration
- Load balancing and auto-scaling
- Backup and disaster recovery
- Cost optimization

### Agent 13: Software Architect & Code Quality
- System architecture design and documentation
- Design pattern implementation and enforcement
- Code review and architectural compliance
- Technical debt identification and remediation
- API design and service boundaries
- Architectural decision records (ADRs)

### Agent 14: Standards & Best Practices Enforcer
- Industry standard compliance (SOLID, DRY, KISS)
- Code style and formatting consistency
- Linting rule configuration and enforcement
- Language-specific best practices
- Performance anti-pattern detection

### Agent 15: Code Review & Refactoring Specialist
- Comprehensive code review processes
- Refactoring legacy code for maintainability
- Code smell detection and elimination
- Test coverage analysis and improvement
- Documentation quality assurance
- Dependency management and security audits

### Agent 16: Enterprise Integration Architect
- Integration pattern implementation
- Microservices architecture design
- Message queue and event streaming systems
- Third-party service integration patterns
- Data consistency and transaction management
- Service mesh and distributed system patterns

### When to Use Specialized Agents
- **Security-focused sprint**: Activate Agent 7
- **UX overhaul sprint**: Activate Agent 8
- **Analytics/data sprint**: Activate Agent 9
- **Mobile development sprint**: Activate Agent 10
- **AI enhancement sprint**: Activate Agent 11
- **Scaling/infrastructure sprint**: Activate Agent 12
- **Code quality/architecture sprint**: Activate Agent 13
- **Standards compliance sprint**: Activate Agent 14
- **Legacy code refactoring sprint**: Activate Agent 15
- **Enterprise integration sprint**: Activate Agent 16

### Architecture Agent Combinations
- **Major refactoring**: Agents 13 + 15 (Architecture + Refactoring)
- **New system design**: Agents 13 + 16 (Architecture + Integration)
- **Code quality overhaul**: Agents 14 + 15 (Standards + Refactoring)
- **Enterprise compliance**: Agents 13 + 14 + 16 (Architecture + Standards + Integration)

**Note**: Keep the core 6-agent system as default. Specialized agents are activated only for specific sprints or complex projects requiring their expertise.

## Overview
[Brief description of your project and its main purpose]

## 📊 System Architecture

### Services & Ports
| Service | Port | Purpose |
|---------|------|---------|
| [Service 1] | [Port] | [Purpose] |
| [Service 2] | [Port] | [Purpose] |

### Authentication
[Describe your authentication system]

## Common Tasks

### Start Development Environment
```bash
[Commands to start your development environment]
```

### Test the System
```bash
[Commands to test that everything is working]
```

## Dependencies
[List key dependencies and requirements]

## Environment Variables
[List important environment variables]

## Common Issues
[Document common problems and solutions]

## 📁 Key File Locations

### [Main Component/Service]
- **[Type]**: `[path]/` - [Description]

### Documentation
- **Guides**: `docs/guides/` - [Description]
- **Features**: `docs/features/` - [Description]
- **TODO Lists**: `docs/todo/` - [Description]

**Documentation Rules**: 
- All documentation must follow the organization system in [docs/DOCUMENTATION_GUIDE.md](docs/DOCUMENTATION_GUIDE.md)
- Never add .md files to root except README.md, CLAUDE.md, and CLAUDE_ORCHESTRATOR.md
- All TODO lists and development plans go in [docs/todo/](docs/todo/) directory

---

## 🔄 Context Handoff Protocol
Every agent MUST use context handoffs:
```bash
# Start of work session
./restore-context.sh              # See what others were working on
./restore-context.sh handoff-XXX  # Restore specific context

# During work (create handoffs when):
./quick-handoff.sh "completed backend API, 3 tests failing"  # Task complete
./quick-handoff.sh "debugging auth issue in login flow"      # Context >70%
./quick-handoff.sh "refactoring database queries - WIP"      # Switching tasks

# End of EVERY session
./quick-handoff.sh "current task status and next steps"      # MANDATORY
```

This ensures no context is lost between agents or sessions!

## 📝 How to Use This System (Optimized for Minimal Testing)

### 1. **Sprint Start (5 minutes)**
- Fill out Sprint Risk Assessment to identify where YOU need to test
- Update Critical Path to show dependencies
- Assign agents with clear focus areas

### 2. **During Sprint (Agents Self-Manage)**
Agents must:
- Run Pre-Commit Checklist before any commit
- Use standardized commit format with TEST:STATUS and BUGS:COUNT
- Update confidence levels (🟢🟡🔴) on completed tasks
- Test integration points with other agents
- **Run bug detection on all modified files** (see Bug Detection System)
- Log any failed experiments to save future time
- **Create context handoffs**: `./quick-handoff.sh "task status"` when:
  - Switching between major tasks
  - Chat context approaching limits (>70%)
  - End of each work session
  - Before starting new chat session
- **Restore context**: `./restore-context.sh` at start of new session

### 3. **Your Quick Review Points**
Focus your limited time on:
- 🔴 **Red Flag Items**: Low confidence features
- 🟡 **Yellow Flag Items**: Medium confidence (quick review)
- ⚠️ **Failed Integrations**: From the Integration Test Results
- 📊 **Confidence Matrix**: See at a glance what needs attention

### 4. **Sprint End (10 minutes)**
- Review Agent Confidence Matrix
- Check only red/yellow confidence items  
- Copy sprint summary to Sprint History
- Clear completed tasks for next sprint

### 5. **Context Management Best Practices**
- **One Task = One Chat**: Don't mix multiple tasks in same context
- **Progress Files**: Each agent maintains `docs/sprints/sprint-X/agent-Y-progress.md`
- **Context Warning**: Watch for slowdowns indicating high usage
- **Clean Starts**: Begin each task with fresh perspective
- **Preserve Knowledge**: Technical details in progress files, only status in CLAUDE.md

**Result**: Agents work efficiently without context limits slowing them down! 🚀