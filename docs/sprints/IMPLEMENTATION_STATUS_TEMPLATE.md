# Implementation Status Check Template

## 📋 Feature: [Feature Name]

**Check Date**: [YYYY-MM-DD]  
**Checked By**: [Name]  
**Conclusion**: ⭕ Not Started | 🟡 Partial | ✅ Complete

## 🔍 Search Strategy

### Keywords Searched
- Primary: [main keywords]
- Secondary: [related terms]
- File patterns: [*.ts, *.tsx, *.js, etc]

### Locations Checked
- [ ] `/src` or `/app` directories
- [ ] `/api` or `/backend` directories  
- [ ] `/database/migrations`
- [ ] `/docs` for documentation
- [ ] `/tests` for test coverage
- [ ] Configuration files
- [ ] Package dependencies

## 📊 Implementation Status

### ✅ What Exists
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| [Component] | [Path] | Working/Broken | [Details] |

### 🚧 Partially Implemented
| Component | Location | % Complete | What's Missing |
|-----------|----------|------------|----------------|
| [Component] | [Path] | [X%] | [List missing parts] |

### ❌ Not Implemented
| Component | Expected Location | Confirmed Missing |
|-----------|------------------|-------------------|
| [Component] | [Where it should be] | ✓ |

## 🔌 Integration Points

### Connected Systems
- ✅ [System A] → [Feature] → [System B]
- ❌ [System C] ← No connection → [Feature]

### API Endpoints
| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| [/api/path] | GET/POST | Working/Missing | [Sample] |

### Database Tables
| Table | Status | Schema Correct | Sample Data |
|-------|--------|----------------|-------------|
| [table_name] | Exists/Missing | Yes/No | Yes/No |

## 💻 Code Analysis

### Working Example
```javascript
// Location: [file path]
// Status: Working
[code snippet if relevant]
```

### Broken/Incomplete Code
```javascript
// Location: [file path]
// Issue: [what's wrong]
[code snippet]
```

## 🧪 Test Coverage

### Existing Tests
- [ ] Unit tests: [coverage %]
- [ ] Integration tests: [found/missing]
- [ ] E2E tests: [found/missing]

### Test Results
```bash
# Command run: [test command]
# Result: [pass/fail]
[relevant output]
```

## 📚 Documentation Status

### Found Documentation
- [Doc Name]: [Path] - [Up to date? Y/N]

### Missing Documentation
- [ ] User guide
- [ ] API documentation  
- [ ] Setup instructions
- [ ] Architecture notes

## 🎯 Implementation Estimate

### If Starting from Scratch
- **Effort**: [X days/weeks]
- **Complexity**: Low/Medium/High
- **Dependencies**: [List]

### If Completing Partial Implementation
- **Effort**: [X days]
- **Tasks**:
  1. [Specific task]
  2. [Specific task]

## 📌 Recommendations

### Immediate Actions
1. [If complete]: Use as-is, just integrate
2. [If partial]: Complete these specific parts...
3. [If missing]: Build from scratch with this approach...

### Technical Approach
- **Reuse**: [What can be reused]
- **Build**: [What needs building]
- **Refactor**: [What needs fixing]

## 🚨 Warnings & Gotchas

- ⚠️ [Known issue or limitation]
- ⚠️ [Deprecated code found]
- ⚠️ [Security concern]

---

## Quick Summary: [Feature Name]

```markdown
**Status**: ⭕ 0% | 🟡 X% | ✅ 100%

**Can we use it?** Yes/No/Partially

**Time to complete**: X days

**Recommendation**: [Start fresh / Complete existing / Use as-is]

**Sprint Planning**: [Only plan work for missing pieces]
```