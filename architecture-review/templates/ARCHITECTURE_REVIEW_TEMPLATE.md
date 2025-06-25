# Architecture Review: [YYYY-MM]

**Review Period**: [Start Date] - [End Date]  
**Lead Architect**: Agent 13  
**Status**: Planning | In Progress | Review | Complete  
**Project**: [Project Name]

## Review Goals

### Primary Focus Areas
1. [Focus Area 1 - e.g., API consistency across services]
2. [Focus Area 2 - e.g., Frontend performance optimization]
3. [Focus Area 3 - e.g., Database query optimization]

### Specific Concerns from Recent Development
- [Issue raised during recent work - e.g., slow endpoint performance]
- [Technical debt from recent features - e.g., duplicate validation logic]
- [Scalability concern - e.g., memory usage in background processes]

### Review Scope
- **Codebase Size**: [Number of files, lines of code]
- **Technology Stack**: [Primary languages, frameworks, databases]
- **Team Size**: [Number of developers]
- **Deployment Model**: [Monolith, microservices, serverless, etc.]

## Agent Assignments

| Agent | Focus Area | Status | Key Findings |
|-------|------------|--------|--------------|
| Agent 13 | System Architecture | 🔴 Not Started | - |
| Agent 14 | Standards Compliance | 🔴 Not Started | - |
| Agent 15 | Refactoring Opportunities | 🔴 Not Started | - |
| Agent 16 | Integration Patterns | 🔴 Not Started | - |

## Review Schedule

### Week 1: Analysis
- **Day 1-2**: Initial codebase scan and metrics collection
- **Day 3-4**: Deep dive analysis in focus areas
- **Day 5**: Compile initial findings and cross-agent review

### Week 2: Reporting
- **Day 1-2**: Generate detailed reports
- **Day 3**: Create ADRs for major architectural decisions
- **Day 4**: Prioritize findings and estimate effort
- **Day 5**: Prepare human review materials

### Week 3: Decision & Planning
- **Day 1-2**: Human review of all reports
- **Day 3**: Architecture decision meeting
- **Day 4**: Create development tasks from findings
- **Day 5**: Update documentation and plan next review

## Critical Findings Summary
<!-- Updated as review progresses -->

### 🔴 Critical (Immediate Action Required)
- [ ] [Finding requiring immediate attention - e.g., security vulnerability]
- [ ] [Critical performance issue - e.g., memory leak]
- [ ] [Data integrity issue - e.g., race condition]

### 🟡 High Priority (Next Sprint/Release)
- [ ] [Important architectural improvement]
- [ ] [Significant technical debt]
- [ ] [Performance optimization opportunity]

### 🟢 Medium Priority (Backlog)
- [ ] [Code quality improvement]
- [ ] [Documentation update]
- [ ] [Minor refactoring opportunity]

### ⚪ Low Priority (Future Consideration)
- [ ] [Nice-to-have improvement]
- [ ] [Experimental technology evaluation]

## Reports Generated

### Standard Reports
- [ ] Comprehensive Architecture Analysis
- [ ] Technical Debt Inventory
- [ ] Performance Hotspots Analysis
- [ ] Code Standards Compliance
- [ ] Security Architecture Review
- [ ] Integration Patterns Audit

### Custom Reports for This Review
- [ ] [Specific report based on focus areas - e.g., Database Performance Analysis]
- [ ] [Project-specific concern - e.g., Mobile App Performance]

## Architectural Decisions Required

### Decision 1: [Topic - e.g., Database Architecture]
- **Issue**: [Description of the architectural challenge]
- **Options**: 
  - A) [Option 1 with pros/cons]
  - B) [Option 2 with pros/cons]
  - C) [Option 3 with pros/cons]
- **Agent Recommendation**: [Which option and why]
- **Human Decision**: [ ] Pending | [ ] Approved | [ ] Rejected
- **ADR**: ADR-[###]-[topic].md

### Decision 2: [Topic - e.g., Frontend State Management]
- **Issue**: [Description]
- **Options**: A) [Option], B) [Option], C) [Option]
- **Agent Recommendation**: [Recommendation with reasoning]
- **Human Decision**: [ ] Pending | [ ] Approved | [ ] Rejected
- **ADR**: ADR-[###]-[topic].md

## Metrics & Measurements

### Code Quality Metrics
| Metric | Current | Target | Status | Trend |
|--------|---------|--------|--------|-------|
| Code Duplication | X% | <5% | 🔴/🟡/🟢 | ↗️/➡️/↘️ |
| Test Coverage | X% | >80% | 🔴/🟡/🟢 | ↗️/➡️/↘️ |
| Cyclomatic Complexity | X avg | <10 | 🔴/🟡/🟢 | ↗️/➡️/↘️ |
| Technical Debt Ratio | X% | <15% | 🔴/🟡/🟢 | ↗️/➡️/↘️ |

### Performance Metrics
| Metric | Current | Target | Status | Trend |
|--------|---------|--------|--------|-------|
| Build Time | X min | <5min | 🔴/🟡/🟢 | ↗️/➡️/↘️ |
| Deploy Time | X min | <10min | 🔴/🟡/🟢 | ↗️/➡️/↘️ |
| Test Execution | X min | <2min | 🔴/🟡/🟢 | ↗️/➡️/↘️ |
| Memory Usage | X GB | <2GB | 🔴/🟡/🟢 | ↗️/➡️/↘️ |

### Technical Debt Inventory
| Category | Items | Estimated Hours | Priority | Trend |
|----------|-------|----------------|----------|--------|
| Code Smells | X | Y | High/Medium/Low | ↗️/➡️/↘️ |
| Outdated Patterns | X | Y | High/Medium/Low | ↗️/➡️/↘️ |
| Missing Tests | X | Y | High/Medium/Low | ↗️/➡️/↘️ |
| Documentation Gaps | X | Y | High/Medium/Low | ↗️/➡️/↘️ |
| Security Issues | X | Y | High/Medium/Low | ↗️/➡️/↘️ |

## Action Items for Development

### Immediate (This Sprint)
1. **[Task Name]**: [Description] - [Estimated effort] - [Assigned to]
2. **[Task Name]**: [Description] - [Estimated effort] - [Assigned to]

### Short Term (Next 2-3 Sprints)
1. **[Task Name]**: [Description] - [Estimated effort] - [Timeline]
2. **[Task Name]**: [Description] - [Estimated effort] - [Timeline]

### Medium Term (This Quarter)
1. **[Task Name]**: [Description] - [Estimated effort] - [Timeline]
2. **[Task Name]**: [Description] - [Estimated effort] - [Timeline]

### Long Term (6+ months)
1. **[Task Name]**: [Description] - [Estimated effort] - [Timeline]
2. **[Task Name]**: [Description] - [Estimated effort] - [Timeline]

## Risk Assessment

### Architecture Risks
| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| [Risk description] | High/Medium/Low | High/Medium/Low | [Strategy] |

### Technical Debt Risks
| Risk | Current Level | Growth Rate | Intervention Point |
|------|---------------|-------------|-------------------|
| [Debt type] | High/Medium/Low | Fast/Moderate/Slow | [Threshold] |

## Review Notes

### What Went Well
- [Positive findings - e.g., good separation of concerns in new modules]
- [Architectural strengths - e.g., clean API design patterns]
- [Process improvements - e.g., better testing practices adopted]

### Areas of Concern
- [Architectural issues - e.g., growing coupling between services]
- [Process gaps - e.g., inconsistent code review practices]
- [Resource constraints - e.g., limited time for refactoring]

### Recommendations for Next Review
- [Focus areas for next cycle - e.g., security architecture deep dive]
- [Process improvements - e.g., automated architecture monitoring]
- [Tool additions - e.g., static analysis integration]

## Review Outcomes

### Decisions Made
1. **[Decision]**: [Outcome and rationale]
2. **[Decision]**: [Outcome and rationale]

### Tasks Created
- [ ] [Development task with clear acceptance criteria]
- [ ] [Refactoring task with scope and timeline]
- [ ] [Research task for future decisions]

### Process Improvements
- [ ] [Architecture review process update]
- [ ] [Documentation template improvement]
- [ ] [Tool or automation addition]

## Sign-off

### Review Completion Checklist
- [ ] All agent analyses completed
- [ ] Reports reviewed by human stakeholders
- [ ] Architectural decisions documented in ADRs
- [ ] Development tasks created and prioritized
- [ ] Team notified of changes and decisions
- [ ] Documentation updated
- [ ] Next review scheduled

**Review Completed By**: [Name and Role]  
**Date**: [Completion Date]  
**Next Review Scheduled**: [Next Review Date]

**Stakeholder Approvals**:
- [ ] Technical Lead: [Name] - [Date]
- [ ] Product Manager: [Name] - [Date]
- [ ] Architecture Review Board: [Name] - [Date]

---

**Review Status**: [ ] Draft | [ ] Under Review | [ ] Approved | [ ] Implemented