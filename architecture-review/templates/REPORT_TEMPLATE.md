# [Report Type] Report

**Generated By**: Agent [#] - [Role]  
**Date**: [YYYY-MM-DD]  
**Review Cycle**: [YYYY-MM]  
**Project**: [Project Name]  
**Severity**: 🔴 Critical | 🟡 High | 🟢 Medium | ⚪ Low

## Executive Summary

[2-3 sentence summary of findings for human review. Highlight the most important issues and recommended actions. Focus on business impact and urgency.]

## Findings Overview

| Finding | Severity | Impact | Effort | Recommendation |
|---------|----------|--------|--------|----------------|
| [Issue 1] | 🔴 Critical | High | 2 days | Immediate fix |
| [Issue 2] | 🟡 High | Medium | 1 week | Next sprint |
| [Issue 3] | 🟢 Medium | Low | 3 days | Backlog |

## Scope & Methodology

### Analysis Scope
- **Files Analyzed**: [Number and types]
- **Technologies Covered**: [Languages, frameworks, tools]
- **Analysis Depth**: [Surface scan, deep analysis, comprehensive review]
- **Time Period**: [Code changes from when to when]

### Analysis Methods
- [Static code analysis tools used]
- [Pattern matching techniques]
- [Manual code review focus areas]
- [Metric collection methods]

## Detailed Analysis

### Finding 1: [Descriptive Title]

**Location**: `path/to/file.ext:lineNumber` or "Multiple files affected"

**Description**:
[Clear explanation of the issue, why it matters, and its impact on the system. Include context about how this affects maintainability, performance, security, or user experience.]

**Evidence**:
```[language]
// Current problematic code or pattern
[code snippet showing the issue with clear annotations]
```

**Root Cause Analysis**:
- **Immediate Cause**: [What directly caused this issue]
- **Contributing Factors**: [What made this more likely to happen]
- **Systemic Issues**: [Broader patterns or processes that led here]

**Impact Analysis**:
- **Performance**: [How this affects system performance]
- **Maintainability**: [How this affects code maintenance]
- **Security**: [Any security implications]
- **User Experience**: [How this affects end users]
- **Developer Experience**: [How this affects the development team]

**Recommended Solution**:
```[language]
// Suggested improvement or fix
[code snippet showing the recommended approach]
```

**Alternative Approaches**:
1. **Option A**: [Description] - Pros: [Benefits] - Cons: [Drawbacks]
2. **Option B**: [Description] - Pros: [Benefits] - Cons: [Drawbacks]

**Implementation Steps**:
1. [Step 1 with estimated time]
2. [Step 2 with estimated time]
3. [Step 3 with estimated time]

**Testing Strategy**:
- [Unit tests to add/modify]
- [Integration tests required]
- [Performance tests needed]
- [Regression tests to run]

---

### Finding 2: [Descriptive Title]

**Location**: Multiple files affected
- `path/to/file1.ext`
- `path/to/file2.ext`
- `path/to/file3.ext`

**Description**:
[Clear explanation of the pattern or systemic issue found across multiple locations]

**Pattern Analysis**:
```[language]
// Example of the problematic pattern
[code snippet showing the recurring issue]
```

**Affected Areas**:
| File/Module | Lines | Complexity | Priority |
|-------------|-------|------------|----------|
| [file1.ext] | X | High/Med/Low | 1-5 |
| [file2.ext] | Y | High/Med/Low | 1-5 |

**Consolidation Opportunity**:
[Description of how these similar pieces could be unified]

**Migration Plan**:
1. **Phase 1**: [Description] - [Effort estimate] - [Timeline]
2. **Phase 2**: [Description] - [Effort estimate] - [Timeline]
3. **Phase 3**: [Description] - [Effort estimate] - [Timeline]

## Metrics & Quantification

### Current State Metrics
- **Files Affected**: [Number]
- **Lines of Code Involved**: [Number]
- **Complexity Score**: [Cyclomatic complexity or similar]
- **Technical Debt Hours**: [Estimated time to fix]
- **Duplication Percentage**: [If applicable]

### Impact Metrics
- **Performance Degradation**: [Percentage or time impact]
- **Maintenance Overhead**: [Time per change/feature]
- **Bug Risk Factor**: [Likelihood multiplier]
- **Developer Velocity Impact**: [Time lost per sprint]

### Post-Remediation Projections
- **Expected Performance Improvement**: [Percentage]
- **Maintenance Time Reduction**: [Percentage]
- **Code Quality Score Improvement**: [Points or percentage]
- **Developer Productivity Gain**: [Time saved per sprint]

## Risk Assessment

### Current Risks
- **Short Term** (1 month): [Risks if not addressed soon]
- **Medium Term** (3 months): [Escalating risks and complications]
- **Long Term** (6+ months): [Potential crisis scenarios]

### Implementation Risks
- **Risk 1**: [Description] - **Probability**: High/Med/Low - **Mitigation**: [Strategy]
- **Risk 2**: [Description] - **Probability**: High/Med/Low - **Mitigation**: [Strategy]
- **Risk 3**: [Description] - **Probability**: High/Med/Low - **Mitigation**: [Strategy]

### Risk vs. Reward Analysis
| Aspect | Do Nothing | Partial Fix | Complete Fix |
|--------|------------|-------------|--------------|
| Cost | $0 | $X | $Y |
| Risk | High | Medium | Low |
| Timeline | N/A | X weeks | Y weeks |
| Benefit | None | Partial | Full |

## Dependencies & Prerequisites

### Prerequisite Work
- [ ] [Task that must be completed first]
- [ ] [Another prerequisite with reasoning]
- [ ] [Infrastructure or tooling requirement]

### Dependent Systems
- **System 1**: [How it's affected and what needs coordination]
- **System 2**: [Impact and coordination requirements]

### External Dependencies
- [Third-party libraries or services that affect this work]
- [Team dependencies or expertise requirements]

## Recommended Priority & Sequencing

**Priority Level**: 🔴 P0 - Critical | 🟡 P1 - High | 🟢 P2 - Medium | ⚪ P3 - Low

**Priority Justification**:
[Detailed reasoning for the assigned priority level, including business impact, technical risk, and effort considerations]

**Sequencing Recommendations**:
1. **First**: [What to tackle first and why]
2. **Second**: [What comes next and dependencies]
3. **Third**: [Final steps and validation]

## Human Decision Points

### Decision A: [Scope of Implementation]
- **Full Implementation**: [Pros, cons, effort, timeline]
- **Partial Implementation**: [Pros, cons, effort, timeline]
- **Defer/Accept Risk**: [Pros, cons, ongoing risk level]

### Decision B: [Technical Approach]
- **Option 1**: [Technical approach with trade-offs]
- **Option 2**: [Alternative approach with trade-offs]
- **Hybrid Approach**: [Combination strategy]

### Agent Recommendation
[Clear recommendation with detailed reasoning, considering business priorities, technical constraints, and team capacity]

## Success Criteria & Validation

### Definition of Done
- [ ] [Specific, measurable outcome]
- [ ] [Performance or quality threshold met]
- [ ] [Documentation updated]
- [ ] [Tests passing with coverage targets]

### Validation Methods
- [How to verify the fix works]
- [Performance benchmarks to run]
- [User acceptance criteria]
- [Long-term monitoring setup]

### Success Metrics
| Metric | Before | Target | Measurement Method |
|--------|--------|--------|--------------------|
| [Metric 1] | X | Y | [How to measure] |
| [Metric 2] | X | Y | [How to measure] |

## Implementation Support

### Code Examples
```[language]
// Example implementation pattern
[Detailed code example showing the recommended approach]
```

### Configuration Changes
```[format]
# Configuration files that need updates
[Show specific config changes needed]
```

### Testing Templates
```[language]
// Test cases to add or modify
[Example test code to guide implementation]
```

## Additional Resources

### Documentation Links
- [Relevant architectural documentation]
- [Coding standards and style guides]
- [Similar issues and their solutions]

### Industry Best Practices
- [Links to industry standards or patterns]
- [Academic papers or technical articles]
- [Open source examples of good implementations]

### Team Knowledge
- [Team members with relevant expertise]
- [Past decisions or discussions related to this area]
- [Training or knowledge sharing opportunities]

---

## Review & Approval Tracking

**Report Status**: [ ] Draft | [ ] Under Review | [ ] Approved | [ ] In Progress | [ ] Completed

**Review History**:
- [Date] - [Reviewer] - [Comments/Status]
- [Date] - [Reviewer] - [Comments/Status]

**Final Approval**: [Name] - [Date] - [Decision]

---

**Next Steps After Approval**:
1. [ ] Create development tasks with clear acceptance criteria
2. [ ] Assign to appropriate team members
3. [ ] Update project roadmap and sprint planning
4. [ ] Set up monitoring and success tracking
5. [ ] Schedule follow-up review to validate implementation