# Architecture Review System - Scaffolding

**Purpose**: Project-agnostic architecture review system for AI agent teams  
**Status**: Production Ready ✅  
**Version**: 1.0

## Overview

This scaffolding provides a complete architecture review system that can be deployed to any software project. It enables AI agents to systematically analyze codebases, identify issues, and generate human-readable reports for architectural decisions.

## Features

- **Human-in-the-Loop**: All findings require human review and approval
- **Agent Specialization**: 4 specialized architecture agents with distinct roles
- **Comprehensive Reporting**: Multiple report types for different stakeholders
- **Action Planning**: Prioritized recommendations with effort estimates
- **Sprint Integration**: Architecture findings feed into development workflows
- **Scalable**: Works for projects from 1K to 1M+ lines of code

## Quick Setup

### 1. Copy Files to Your Project
```bash
# From your project root
cp -r docs/scaffolding/architecture-review/templates docs/architecture/
cp docs/scaffolding/architecture-review/agent-prompts/* .
```

### 2. Initialize First Review
```bash
# Create review directory
mkdir -p docs/architecture/review-$(date +%Y-%m)

# Copy templates
cp docs/architecture/ARCHITECTURE_REVIEW_TEMPLATE.md docs/architecture/review-$(date +%Y-%m)/README.md
```

### 3. Update Your CLAUDE.md
```markdown
## 🏗️ Architecture Review Status

### Current Review Cycle: [YYYY-MM]
**Status**: 🔴 Not Started  
**Focus**: [Define focus areas]

### Critical Architecture Findings
| Finding | Severity | Impact | Status |
|---------|----------|--------|--------|
| [Add findings as they're discovered] | 🔴 Critical | [Impact] | Awaiting decision |

**📊 Full Architecture Reports**: [docs/architecture/review-[YYYY-MM]/](docs/architecture/review-[YYYY-MM]/)
```

## Architecture Agents

### Agent 13: Software Architect & Code Quality
**Role**: System-wide architecture analysis  
**Specialties**:
- Design pattern identification and enforcement
- Service boundary analysis
- Technical debt assessment
- Architectural decision records (ADRs)

### Agent 14: Standards & Best Practices Enforcer
**Role**: Code convention compliance  
**Specialties**:
- Coding standard violations
- File naming consistency
- API design patterns
- Documentation quality

### Agent 15: Code Review & Refactoring Specialist
**Role**: Code quality and maintainability  
**Specialties**:
- Code smell detection
- Refactoring opportunities
- Performance optimization
- Test coverage analysis

### Agent 16: Enterprise Integration Architect
**Role**: Service integration patterns  
**Specialties**:
- API consistency
- Service communication
- Security patterns
- Integration testing

## Report Types

### 1. Comprehensive Architecture Report
**Audience**: Technical leadership, product managers  
**Content**: Executive summary, critical findings, action plan  
**Frequency**: Monthly

### 2. Technical Debt Inventory
**Audience**: Engineering teams, technical leads  
**Content**: Debt categorization, cost analysis, remediation plan  
**Frequency**: Quarterly

### 3. Performance Hotspots Report
**Audience**: DevOps, performance engineers  
**Content**: Bottleneck analysis, optimization roadmap  
**Frequency**: As needed

### 4. Code Standards Report
**Audience**: Development teams  
**Content**: Convention violations, style guide updates  
**Frequency**: Monthly

### 5. Security Architecture Audit
**Audience**: Security teams, compliance  
**Content**: Vulnerability assessment, remediation plan  
**Frequency**: Quarterly

## Workflow

### Monthly Review Cycle
```
Week 1: Agent Analysis
├── Day 1-2: Codebase scanning
├── Day 3-4: Deep analysis
└── Day 5: Initial findings

Week 2: Report Generation
├── Day 1-2: Detailed reports
├── Day 3: ADR creation
├── Day 4: Prioritization
└── Day 5: Human review prep

Week 3: Decision & Planning
├── Day 1-2: Human review
├── Day 3: Architecture decisions
├── Day 4: Sprint planning
└── Day 5: Documentation
```

### Agent Coordination
1. **Agent 13** sets architectural vision and identifies system-wide issues
2. **Agent 14** ensures implementation follows standards
3. **Agent 15** identifies specific refactoring opportunities
4. **Agent 16** validates service integration patterns

## Customization

### For Different Tech Stacks

**Frontend-Heavy Projects**:
- Focus Agent 14 on component standards
- Add React/Vue/Angular specific linting
- Emphasize bundle size analysis

**Backend-Heavy Projects**:
- Focus Agent 16 on API consistency
- Add database performance analysis
- Emphasize security patterns

**Microservices Projects**:
- Focus Agent 13 on service boundaries
- Add distributed system patterns
- Emphasize observability

**Legacy Projects**:
- Focus Agent 15 on modernization
- Add migration planning
- Emphasize risk assessment

### For Different Team Sizes

**Small Teams (1-5 devs)**:
- Monthly reviews
- Focus on critical issues only
- Simplified reporting

**Medium Teams (5-20 devs)**:
- Bi-weekly reviews
- Full report suite
- Dedicated architecture time

**Large Teams (20+ devs)**:
- Weekly monitoring
- Automated alerting
- Architecture review board

## Success Metrics

Track these KPIs to measure architecture health:

| Metric | Target | Frequency |
|--------|--------|-----------|
| Code Duplication | <5% | Monthly |
| Test Coverage | >80% | Weekly |
| Build Time | <5min | Daily |
| Deploy Time | <10min | Daily |
| Critical Issues | 0 | Monthly |
| Tech Debt Hours | Decreasing | Quarterly |

## Integration Points

### Sprint Planning
- Architecture findings become sprint tasks
- Technical debt items in backlog
- Performance improvements prioritized

### Code Reviews
- Standards violations caught early
- Architecture patterns enforced
- Knowledge sharing improved

### Documentation
- ADRs capture decisions
- Standards updated regularly
- Onboarding materials current

## Common Pitfalls

1. **Analysis Paralysis**: Focus on high-impact issues first
2. **Perfect Architecture**: Prioritize pragmatic improvements
3. **Ignored Reports**: Ensure human review happens
4. **Stale Reviews**: Keep review cycles regular
5. **No Follow-through**: Track implementation progress

## Advanced Features

### Automated Monitoring
```javascript
// Example: Automated architecture alerts
const alerts = {
  duplicateCode: { threshold: 10%, severity: 'high' },
  complexity: { threshold: 15, severity: 'medium' },
  testCoverage: { threshold: 70%, severity: 'high' }
};
```

### Trend Analysis
- Track metrics over time
- Identify improvement patterns
- Predict technical debt growth

### Integration with CI/CD
- Fail builds on critical violations
- Generate reports on every release
- Track architecture metrics in dashboards

## Support & Maintenance

### Regular Updates
- Templates evolve with best practices
- Agent prompts improve with experience
- Report formats adapt to team needs

### Community Feedback
- Share successful patterns
- Report issues and improvements
- Contribute new report types

---

**Next Steps**:
1. Review the templates in `/templates/`
2. Customize agent prompts in `/agent-prompts/`
3. Run your first architecture review
4. Iterate based on team feedback