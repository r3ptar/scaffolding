# Human Review Queue - Sprint #[X]

**Last Updated**: [Auto-generated timestamp]  
**Review Status**: 🟢 All Clear | 🟡 Needs Attention | 🔴 Critical Issues

## 🚨 CRITICAL (Review Immediately)
<!-- Items requiring immediate human decision to unblock agents -->

**[No critical items] OR:**

- **[Agent X]** - [Brief description] - **BLOCKING** [List of blocked agents]
  - **Impact**: [What's affected]
  - **Decision Needed**: [Specific question/approval needed]
  - **Files**: [Relevant file paths]
  - **Quick Action**: `echo "approved|blocked|needs-revision" > .agent-X-decision`

## 🟡 HIGH PRIORITY (Daily Review)
<!-- Important decisions that should be made within 24 hours -->

**[No high priority items] OR:**

- **[Agent Y]** - [Description]
  - **Confidence**: 🟢🟡🔴
  - **Integration Impact**: [Which agents affected]
  - **Deadline**: [When decision needed]
  - **Context**: [Link to handoff or files]

## 🟢 MEDIUM PRIORITY (Weekly Batch Review)
<!-- Improvements and optimizations that can wait -->

**[No medium priority items] OR:**

- **[Agent Z]** - [Description]
  - **Type**: Feature|Improvement|Optimization|Documentation
  - **Effort**: [Estimated time/complexity]
  - **Value**: [Expected benefit]

## 📊 Sprint Health Dashboard

### Agent Status Overview
```
🟢 Agent 1: On track    | Confidence: High    | Last Update: 2h ago
🟡 Agent 2: Blocked     | Confidence: Medium  | Last Update: 4h ago  
🟢 Agent 3: Completed   | Confidence: High    | Last Update: 1h ago
🔴 Agent 4: Critical    | Confidence: Low     | Last Update: 6h ago
🟢 Agent 5: On track    | Confidence: High    | Last Update: 30m ago
🟢 Agent 6: On track    | Confidence: Medium  | Last Update: 1h ago
```

### Sprint Velocity
- **Completion**: [X]% ([Y]/[Z] tasks)
- **Points**: [A]/[B] total points
- **Timeline**: Day [X] of [Y] (🟢 On Schedule | 🟡 At Risk | 🔴 Behind)
- **Quality**: [X] High Confidence | [Y] Medium | [Z] Low Confidence

### Integration Status
- **Critical Path**: [Current bottleneck or "No blockers"]
- **Ready Handoffs**: [Number] handoffs ready to proceed
- **Failed Tests**: [Number] integration tests failing
- **Performance**: [Any performance concerns or "Within targets"]

## ⚡ Quick Terminal Actions

### Approve Waiting Items
```bash
# Batch approve all medium-priority items
./quick-approve.sh --batch medium

# Approve specific agent's request
./quick-approve.sh agent-2 "approved with minor changes"

# Block with reason
./quick-approve.sh agent-4 "blocked: security review needed"
```

### Sprint Management
```bash
# Update sprint status
./update-sprint-health.sh

# Generate progress report
./generate-sprint-report.sh

# Check agent activity
./check-agent-status.sh --stale-threshold=2h
```

### Review Workflow
```bash
# Morning review routine (5 minutes)
cat human-review.md | head -50          # Check critical items
./check-blockers.sh                     # Verify no new blockers
./approve-routine-items.sh              # Auto-approve safe items

# Weekly batch review (15 minutes)  
./review-pending-improvements.sh       # Review accumulated suggestions
./update-sprint-system.sh              # Implement approved improvements
```

## 📈 Trends & Patterns

### Recent Decisions
- **[Date]**: Approved Agent 2's API change - resulted in 20% performance improvement
- **[Date]**: Blocked Agent 5's database migration - prevented data loss
- **[Date]**: Implemented Agent 1's testing suggestion - reduced bug count by 40%

### Agent Performance Trends
- **Agent 1**: Consistently high confidence, minimal review needed
- **Agent 2**: Improving - recent suggestions show good judgment
- **Agent 4**: Needs closer oversight - frequent integration issues

### System Improvements Implemented
- **This Sprint**: [List approved improvements and their impact]
- **Success Rate**: [Percentage] of agent suggestions were beneficial
- **Time Savings**: [Estimated] hours saved through process improvements

## 🔄 Meta-Review: Human-in-Loop Optimization

### Review Efficiency Metrics
- **Average Daily Review Time**: [X] minutes (Target: <10 minutes)
- **Decision Latency**: Average [X] hours from request to decision
- **Decision Accuracy**: [Y]% of decisions led to successful outcomes
- **Agent Satisfaction**: [Feedback on review process responsiveness]

### Process Improvements Needed
- [ ] Faster notification of critical items
- [ ] Better categorization of review types  
- [ ] Automated approval for low-risk items
- [ ] Improved agent confidence calibration

---

## 📝 Instructions for Agents

### Adding Items to Review Queue
```bash
# Critical item (blocks other agents)
./update-review-queue.sh --critical "agent-3" "Database schema change affects API and frontend" --blocks="agent-1,agent-2"

# High priority item
./update-review-queue.sh --high "agent-5" "Performance optimization trade-off decision" --deadline="2025-06-26"

# Medium priority improvement
./update-review-queue.sh --medium "agent-1" "Suggest new testing framework" --type="improvement"
```

### When to Request Review
- **Critical**: Decisions that block other agents or affect system architecture
- **High**: Technical trade-offs, API changes, security considerations
- **Medium**: Process improvements, optimizations, feature suggestions

### How to Write Effective Review Requests
1. **Be Specific**: Exact decision needed, not just "please review"
2. **Include Context**: Link to handoff, files, or previous discussions
3. **Show Impact**: Who/what is affected by this decision
4. **Suggest Options**: Provide 2-3 alternatives with pros/cons
5. **Set Urgency**: Realistic deadline based on impact

---

**Template Version**: 1.0  
**Compatible With**: Sprint System v1.0, Context Handoff v1.0  
**Next Review**: Human review process effectiveness assessment in Sprint #[X+1]