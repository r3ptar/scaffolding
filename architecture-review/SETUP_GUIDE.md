# Architecture Review System - Setup Guide

**Purpose**: Step-by-step guide to implement the architecture review system in any project  
**Time Required**: 30-60 minutes initial setup  
**Prerequisites**: Git repository, basic understanding of project structure

## Quick Setup (5 minutes)

### 1. Copy Architecture Framework
```bash
# From your project root directory
mkdir -p docs/architecture
cp -r [path-to-this-scaffolding]/templates/* docs/architecture/
```

### 2. Initialize First Review
```bash
# Create current review directory
REVIEW_DATE=$(date +%Y-%m)
mkdir -p docs/architecture/review-$REVIEW_DATE/{reports,decisions}

# Copy review template
cp docs/architecture/ARCHITECTURE_REVIEW_TEMPLATE.md docs/architecture/review-$REVIEW_DATE/README.md
```

### 3. Update Project Documentation
Add to your main README.md:
```markdown
## Architecture Reviews

Monthly architecture reviews ensure code quality and maintainability.

- **Current Review**: [docs/architecture/review-[YYYY-MM]/](docs/architecture/review-[YYYY-MM]/)
- **Architecture Guidelines**: [docs/architecture/README.md](docs/architecture/README.md)
```

## Detailed Setup

### Step 1: Project Assessment

Before implementing, assess your project:

```bash
# Basic project metrics
find . -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.java" | wc -l
git log --oneline --since="1 month ago" | wc -l
git log --format='%an' | sort -u | wc -l
```

**Project Size Guidelines**:
- **Small** (< 10K LOC): Monthly reviews
- **Medium** (10K-100K LOC): Bi-weekly reviews  
- **Large** (> 100K LOC): Weekly monitoring

### Step 2: Customize Agent Prompts

Copy and customize agent prompts for your tech stack:

```bash
mkdir -p docs/architecture/agents
cp [scaffolding-path]/agent-prompts/* docs/architecture/agents/
```

**Customization Examples**:

For **React/Node.js** projects:
```markdown
# Add to AGENT_14_STANDARDS_PROMPT.md

## React-Specific Standards
- Components use PascalCase naming
- Hooks use camelCase with 'use' prefix
- Props are destructured in component signature
- State updates use functional form when dependent on previous state
```

For **Python** projects:
```markdown
# Add to AGENT_15_REFACTORING_PROMPT.md

## Python-Specific Analysis
- Check PEP 8 compliance
- Identify list comprehension opportunities
- Find generator expression potential
- Analyze context manager usage
```

### Step 3: Configure Review Schedule

Create a review calendar based on your team size:

**Small Teams (1-5 developers)**:
```yaml
# docs/architecture/review-schedule.yml
schedule:
  frequency: monthly
  duration: 1 week
  phases:
    analysis: 2 days
    reporting: 2 days
    review: 1 day
```

**Large Teams (20+ developers)**:
```yaml
# docs/architecture/review-schedule.yml
schedule:
  frequency: weekly
  duration: 3 days
  phases:
    analysis: 1 day
    reporting: 1 day
    review: 1 day
```

### Step 4: Set Up CLAUDE.md Integration

Add architecture section to your CLAUDE.md:

```markdown
## 🏗️ Architecture Review Status

### Current Review Cycle: [YYYY-MM]
**Status**: 🔴 Not Started | 🟡 In Progress | 🟢 Complete  
**Focus**: [Define focus areas for this review]

### Critical Architecture Findings
| Finding | Severity | Impact | Status |
|---------|----------|--------|--------|
| [Add findings as discovered] | 🔴 Critical | [Impact description] | Awaiting decision |

### Architecture Decisions Pending
1. **[Decision Topic]** - See [ADR-XXX](docs/architecture/review-[YYYY-MM]/decisions/ADR-XXX-topic.md)

**📊 Full Architecture Reports**: [docs/architecture/review-[YYYY-MM]/](docs/architecture/review-[YYYY-MM]/)
```

## Technology-Specific Setup

### For Microservices Projects

Additional directories and focus areas:

```bash
mkdir -p docs/architecture/{service-catalog,integration-patterns,security-patterns}
```

Agent customizations:
- **Agent 13**: Focus on service boundaries
- **Agent 16**: Emphasize inter-service communication
- **Agent 14**: API consistency across services
- **Agent 15**: Cross-service refactoring opportunities

### For Frontend-Heavy Projects

Focus areas:
- Component architecture
- State management patterns
- Performance optimization
- Bundle size analysis

```bash
# Add frontend-specific metrics
mkdir -p docs/architecture/frontend-metrics
```

### For Legacy Codebases

Special considerations:
- Gradual modernization tracking
- Risk assessment for changes
- Migration planning
- Technical debt prioritization

```bash
mkdir -p docs/architecture/{modernization-plan,risk-assessment}
```

## Tool Integration

### Static Analysis Integration

**SonarQube Setup**:
```yaml
# sonar-project.properties
sonar.projectKey=your-project
sonar.organization=your-org
sonar.sources=src
sonar.exclusions=**/node_modules/**,**/tests/**
sonar.coverage.exclusions=**/tests/**
```

**ESLint for JavaScript/TypeScript**:
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "complexity": ["warn", 10],
    "max-lines-per-function": ["warn", 50],
    "max-depth": ["warn", 4]
  }
}
```

### CI/CD Integration

**GitHub Actions Workflow**:
```yaml
# .github/workflows/architecture-review.yml
name: Architecture Review
on:
  schedule:
    - cron: '0 9 1 * *'  # First day of month at 9 AM
  workflow_dispatch:

jobs:
  architecture-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Architecture Analysis
        run: |
          # Run static analysis tools
          npm run lint
          npm run audit
          # Generate metrics report
          npm run architecture-metrics
```

## Team Onboarding

### Developer Setup

Create onboarding checklist:

```markdown
# Architecture Review Onboarding

## For New Team Members

### Setup Checklist
- [ ] Read architecture review README
- [ ] Understand review schedule
- [ ] Know how to check current review status
- [ ] Understand how findings become tasks

### Monthly Responsibilities
- [ ] Review architecture findings
- [ ] Participate in architecture decisions
- [ ] Implement assigned improvements
- [ ] Follow coding standards
```

### Review Participant Roles

**Architecture Review Board**:
- Technical lead
- Senior developers
- Product manager
- DevOps engineer

**Review Process**:
1. **Week 1**: Agents analyze codebase
2. **Week 2**: Human review of findings
3. **Week 3**: Decision making and task creation
4. **Week 4**: Implementation planning

## Customization Examples

### For Different Industries

**FinTech Projects**:
```markdown
## Additional Security Requirements
- PCI DSS compliance checking
- Financial data encryption validation
- Audit trail completeness
- Regulatory requirement mapping
```

**Healthcare Projects**:
```markdown
## HIPAA Compliance Focus
- PHI data handling patterns
- Access control validation
- Audit logging completeness
- Data retention compliance
```

### For Different Team Sizes

**Solo Developer**:
```yaml
review:
  frequency: quarterly
  focus: technical_debt
  automation: high
  human_review: minimal
```

**Large Organization**:
```yaml
review:
  frequency: weekly
  focus: consistency
  automation: medium  
  human_review: comprehensive
  stakeholders: [tech_lead, architect, product_manager]
```

## Advanced Configuration

### Metrics Dashboard Setup

Create architecture health dashboard:

```javascript
// docs/architecture/metrics/dashboard.js
const metrics = {
  codeQuality: {
    complexity: await getComplexityMetrics(),
    duplication: await getDuplicationMetrics(),
    coverage: await getCoverageMetrics()
  },
  architecture: {
    coupling: await getCouplingMetrics(),
    cohesion: await getCohesionMetrics(),
    layering: await getLayeringMetrics()
  }
};
```

### Automated Report Generation

```bash
#!/bin/bash
# scripts/generate-architecture-report.sh

echo "Generating architecture review report..."

# Run static analysis
sonar-scanner

# Generate metrics
npm run metrics

# Create report directory
REVIEW_DIR="docs/architecture/review-$(date +%Y-%m)"
mkdir -p "$REVIEW_DIR/reports"

# Generate automated reports
node scripts/generate-tech-debt-report.js > "$REVIEW_DIR/reports/tech-debt.md"
node scripts/generate-performance-report.js > "$REVIEW_DIR/reports/performance.md"

echo "Report generated in $REVIEW_DIR"
```

## Troubleshooting

### Common Setup Issues

**Issue**: Agents producing generic findings
**Solution**: Customize agent prompts for your specific tech stack

**Issue**: Too many findings to review
**Solution**: Focus on critical and high-priority items first

**Issue**: Team not engaging with reviews
**Solution**: Start with small, quick wins to build momentum

**Issue**: Reviews taking too long
**Solution**: Use automated tools for basic analysis, focus human review on decisions

### Performance Optimization

For large codebases:
```bash
# Use file sampling for initial analysis
find . -name "*.js" | shuf -n 100 > sample-files.txt

# Focus on changed files only
git diff --name-only HEAD~30 > recent-changes.txt
```

## Success Validation

### Week 1 Checklist
- [ ] Architecture review directory created
- [ ] First review cycle initiated
- [ ] Team understands process
- [ ] Tools configured and working

### Month 1 Checklist
- [ ] First complete review cycle done
- [ ] Architecture decisions documented
- [ ] Development tasks created from findings
- [ ] Team feedback collected and addressed

### Quarter 1 Checklist
- [ ] Multiple review cycles completed
- [ ] Measurable improvements in code quality
- [ ] Team velocity improved
- [ ] Process refined based on experience

## Next Steps

After setup:
1. Run first architecture review
2. Create development tasks from findings
3. Establish regular review schedule
4. Measure and track improvements
5. Refine process based on team feedback

**Remember**: Start small, focus on high-impact issues, and build team buy-in through quick wins.