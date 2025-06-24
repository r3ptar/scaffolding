# Bug Tracking Workflow Guide

**Version**: 1.0.0  
**Last Updated**: June 23, 2025  
**Maintainer**: Development Team

## Overview

This guide explains how to use the bug tracking system effectively, from discovery to resolution. The system is designed to provide comprehensive tracking while maintaining simplicity for daily development workflows.

**🧪 Testing Integration**: This workflow now includes the comprehensive bug testing methodology. See `/docs/bugs/testing/` for detailed testing guides and templates.

---

## Bug Discovery & Reporting

### 1. When to Create a Bug Report

**Create a bug report for:**
- Functional issues that prevent expected behavior
- Performance problems affecting user experience
- Security vulnerabilities or concerns
- Data integrity issues
- UI/UX problems that impact usability
- Integration failures with external services

**Don't create bug reports for:**
- Feature requests (use `/docs/todo/feature-requests.md`)
- Technical debt items (use `/docs/todo/technical-debt.md`)
- Documentation updates (create PR directly)
- Minor typos or copy changes

### 2. Bug Discovery Sources

**Internal Discovery:**
- Developer testing during implementation
- Code review findings
- Automated testing failures
- Performance monitoring alerts
- Security scan results

**External Discovery:**
- User feedback and reports
- Customer support tickets
- Beta tester reports
- Production monitoring alerts
- Community forum reports

### 3. Initial Assessment

Before creating a bug report, verify:
- [ ] Issue is reproducible
- [ ] Not a duplicate of existing bug
- [ ] Actually a bug (not expected behavior)
- [ ] Affects current production version
- [ ] Has user or business impact

---

## Bug Classification

### Severity Levels

#### 🔴 Critical
- **Criteria**: System completely broken, security breach, data loss
- **Examples**: Authentication completely broken, payment system down, data corruption
- **Response Time**: Immediate (within 1 hour)
- **Escalation**: Notify entire team immediately

#### 🟠 High
- **Criteria**: Major functionality broken, significant user impact
- **Examples**: Competition system down, bulk operations failing, mobile app unusable
- **Response Time**: Same day (within 8 hours)
- **Escalation**: Notify team lead and relevant specialists

#### 🟡 Medium
- **Criteria**: Moderate impact, workarounds available
- **Examples**: Minor UI issues, performance degradation, intermittent failures
- **Response Time**: Within 2-3 days
- **Escalation**: Normal development workflow

#### 🟢 Low
- **Criteria**: Minor issues, cosmetic problems
- **Examples**: Typos, minor visual glitches, non-critical missing features
- **Response Time**: Next sprint or when time permits
- **Escalation**: Include in regular planning

### Component Categories

- **Authentication & Auth Flow**: Login, signup, wallet integration
- **Competition System**: Competitions, judging, entries, leaderboards
- **Strain Management**: Strain CRUD, genetic mapping, lineage
- **Mobile Interface**: Mobile-specific issues, responsive design
- **API/Backend**: Server-side logic, database, integrations
- **UI/Navigation**: Frontend interface, navigation, styling
- **Performance**: Speed, memory, optimization issues
- **Security**: Vulnerabilities, permission issues
- **Notifications**: Real-time updates, email notifications

---

## Bug Lifecycle Management

### Status Definitions

| Status | Description | Who Updates | Next Action |
|--------|-------------|-------------|-------------|
| 🔴 **Open** | Newly reported, needs investigation | Reporter | Assign developer |
| 🟡 **In Progress** | Being actively worked on | Developer | Complete fix |
| 🔵 **Testing** | Fix implemented, needs verification | Developer | Test and verify |
| 🟢 **Fixed** | Resolution confirmed working | Tester | Close bug |
| ⏸️ **On Hold** | Paused due to dependencies | Team Lead | Reassess |
| ❌ **Won't Fix** | Decided not to resolve | Team Lead | Document decision |

### Workflow Steps

#### Step 1: Initial Report
1. **Create Bug Report**
   - Use template: `/docs/bugs/templates/bug-report-template.md`
   - Fill in all required sections
   - Add to appropriate directory (`/docs/bugs/active/`)

2. **Update Main Index**
   - Add entry to `/docs/bugs/BUG_INDEX.md`
   - Include in appropriate severity section
   - Update bug count metrics

3. **Assign Bug ID**
   - Use format: `BUG-XXX` (sequential numbering)
   - Update both filename and internal references

#### Step 2: Triage & Assignment
1. **Review & Validate**
   - Confirm reproducibility
   - Assess severity and impact
   - Check for duplicates

2. **Assign Priority & Owner**
   - Set severity level (🔴🟠🟡🟢)
   - Assign to appropriate developer/team
   - Set target resolution timeframe

3. **Update Status**
   - Mark as "In Progress" when assigned
   - Notify assigned developer
   - Update main index status

#### Step 3: Investigation & Fix
1. **Developer Investigation**
   - Add findings to bug report
   - Update investigation notes section
   - Document root cause analysis

2. **Implementation**
   - Develop fix following standard process
   - Include tests for bug scenario
   - Update bug report with solution approach

3. **Code Review**
   - Standard PR review process
   - Include bug report link in PR
   - Verify fix addresses root cause

#### Step 4: Testing & Verification
1. **Testing Protocol**
   - Test original reproduction steps
   - Verify fix works as expected
   - Test for regressions in related areas
   - Update bug report with test results

2. **Verification Checklist**
   - [ ] Original issue no longer reproduces
   - [ ] Fix works across all environments
   - [ ] No new issues introduced
   - [ ] Documentation updated if needed

#### Step 5: Resolution & Closure
1. **Mark as Fixed**
   - Update bug status to "Fixed"
   - Add resolution summary to bug report
   - Include PR/commit references

2. **Update Documentation**
   - Move to "Recently Fixed" section in main index
   - Update bug metrics and counts
   - Archive to `/docs/bugs/fixed/` after 30 days

---

## File Organization

### Directory Structure
```
/docs/bugs/
├── BUG_INDEX.md           # Main registry (keep updated)
├── active/                # Current open bugs
│   ├── BUG-001-*.md      # Individual bug reports
│   ├── BUG-002-*.md
│   └── ...
├── fixed/                 # Resolved bugs (for reference)
│   ├── 2025-06/          # Organized by month
│   │   ├── BUG-XXX-*.md
│   │   └── ...
│   └── ...
├── known-issues/          # Documented limitations
│   ├── KNOWN-001-*.md
│   └── ...
└── templates/             # Templates and guides
    ├── bug-report-template.md
    ├── known-issue-template.md
    └── workflow-guide.md (this file)
```

### File Naming Conventions

**Active Bugs:**
- Format: `BUG-XXX-brief-description.md`
- Example: `BUG-001-mobile-auth-loop.md`

**Known Issues:**
- Format: `KNOWN-XXX-brief-description.md`
- Example: `KNOWN-001-wallet-signature-deletes.md`

**Fixed Bugs:**
- Move to `/fixed/YYYY-MM/` directory
- Keep original filename
- Reference in main index with resolution date

---

## Integration with Development Workflow

### Git Integration

**Commit Messages:**
```bash
# Reference bug in commits
git commit -m "fix: resolve mobile auth loop issue (BUG-001)

- Add mobile-specific wallet connection handling
- Implement fallback localStorage for mobile browsers
- Add mobile detection utility

Closes BUG-001"
```

**Branch Naming:**
```bash
# Use bug ID in branch names
git checkout -b fix/bug-001-mobile-auth-loop
```

**Pull Request Template:**
```markdown
## Bug Fix: BUG-XXX

**Bug Report**: [BUG-XXX](link-to-bug-report)

### Summary
Brief description of the fix

### Changes Made
- List of changes

### Testing
- How the fix was tested
- Verification steps

### Closes
BUG-XXX
```

### Code Comments

**Reference bugs in code:**
```typescript
// BUG-001: Mobile browsers need special handling for wallet connections
if (isMobileDevice()) {
  // Implement mobile-specific auth flow
  return handleMobileAuth();
}
```

### Testing Integration

**Bug Regression Tests:**
```typescript
// Add tests to prevent regression
describe('BUG-001: Mobile Auth Loop', () => {
  it('should complete auth without infinite loop on mobile', async () => {
    // Test implementation
  });
});
```

---

## Quality Assurance

### Bug Report Quality Checklist

**Before Submitting:**
- [ ] Clear, descriptive title
- [ ] Reproducible steps provided
- [ ] Expected vs actual behavior described
- [ ] Environment details included
- [ ] Screenshots/videos attached if relevant
- [ ] Impact assessment completed
- [ ] Severity level assigned appropriately

**During Investigation:**
- [ ] Root cause identified
- [ ] Solution approach documented
- [ ] Testing plan created
- [ ] Risk assessment completed

**Before Closing:**
- [ ] Fix verified in all environments
- [ ] Regression testing completed
- [ ] Documentation updated
- [ ] Metrics updated in main index

### Common Mistakes to Avoid

1. **Vague Descriptions**: "It's broken" vs "Login fails with 500 error"
2. **Missing Steps**: Not providing reproduction steps
3. **Wrong Severity**: Marking minor issues as critical
4. **Duplicate Reports**: Not checking existing bugs first
5. **Missing Updates**: Not updating status as work progresses

---

## Metrics & Reporting

### Weekly Bug Review

**Metrics to Track:**
- Total active bugs by severity
- Average resolution time
- Bug discovery rate vs fix rate
- Component areas with most issues
- Team member workload distribution

**Review Questions:**
- Are critical/high bugs being resolved quickly enough?
- Which components need more testing/attention?
- Are we introducing new bugs faster than fixing them?
- Do we need to adjust team priorities?

### Monthly Bug Analysis

**Trend Analysis:**
- Bug types and patterns
- Root cause categories
- Prevention opportunities
- Process improvements needed

**Quality Metrics:**
- Bug fix quality (regression rate)
- First-time fix success rate
- Customer-reported vs internal bugs
- Testing effectiveness

---

## Escalation Procedures

### Critical Bug Escalation

**Immediate Actions:**
1. Update bug status to critical
2. Notify team lead and on-call developer
3. Create emergency communication channel
4. Assess user impact and create status page update
5. Begin immediate investigation

**Communication Protocol:**
- Updates every 30 minutes until resolved
- Stakeholder notification within 1 hour
- Public status updates if user-facing
- Post-mortem scheduled after resolution

### Blocked Bug Resolution

**When bugs can't be resolved:**
1. Document blocking factors clearly
2. Identify dependencies and owners
3. Escalate to appropriate level
4. Set review timeline
5. Consider interim workarounds

---

## Maintenance & Administration

### Weekly Maintenance Tasks

- [ ] Review all open bugs for status updates
- [ ] Update main index with current metrics
- [ ] Archive resolved bugs older than 30 days
- [ ] Check for bugs that need priority updates
- [ ] Verify bug assignments are still valid

### Monthly Maintenance Tasks

- [ ] Generate bug trends report
- [ ] Review and update severity criteria if needed
- [ ] Clean up old fixed bugs
- [ ] Update workflow documentation
- [ ] Assess system effectiveness and improvements

### System Health Indicators

**Green (Healthy):**
- <5 open critical/high bugs
- Average resolution time <3 days
- Fix rate > discovery rate

**Yellow (Attention Needed):**
- 5-10 open critical/high bugs
- Average resolution time 3-7 days
- Fix rate = discovery rate

**Red (Action Required):**
- >10 open critical/high bugs
- Average resolution time >7 days
- Discovery rate > fix rate

---

## Tools & Integration

### Recommended Tools

**For Bug Tracking:**
- Main system: This markdown-based system
- Cross-reference: GitHub Issues for code-related bugs
- Communication: Team chat for urgent bugs

**For Analysis:**
- Bug metrics: Extract from main index
- Trend analysis: Monthly review meetings
- Reporting: Generate from markdown data

### Future Enhancements

**Planned Improvements:**
- Automated bug metrics generation
- Integration with GitHub Issues
- Bug template validation
- Notification system for status changes

---

## Contact & Support

**Bug Tracking System Questions:**
- Documentation issues: Create PR
- Process improvements: Team discussion
- Tool problems: Contact development team

**Emergency Bug Reporting:**
- Critical issues: Use team emergency channel
- Security issues: Follow security reporting process
- Production outages: Contact on-call engineer

---

*This workflow guide is a living document. Update it as the process evolves and improves.*

**Last Updated**: June 23, 2025  
**Next Review**: July 23, 2025  
**Version**: 1.0.0