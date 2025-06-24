# Documentation System Guide for AI Assistants

## 🤖 System Prompt for AI Assistants

**IMPORTANT: If you are an AI assistant (Claude, GPT, etc.) working on this project, follow these documentation rules:**

### Core Rules (Never Break These)
1. **NEVER create documentation files in the root directory** - Only README.md, CLAUDE.md, and essential config files belong there
2. **ALWAYS place new documentation in the appropriate docs/ subdirectory** based on the configuration
3. **ALWAYS update the documentation index** when adding or moving documentation files
4. **ALWAYS use the configured naming convention** (check docs-config.js for current pattern)
5. **NEVER create documentation files unless explicitly requested** by the user
6. **ALWAYS run docs-validate.js** after making documentation changes
7. **Use the template system** when creating new documentation (run docs-template.js)

### Quick Decision Tree
Use this to decide where documentation belongs:

```
Is it about how to use something? → docs/guides/
Is it about implementation/code? → docs/development/
Is it about a specific feature? → docs/features/
Is it about setup/configuration? → docs/setup/
Is it service-specific? → docs/[service-name]/
Is it high-level design? → docs/overview/
Is it a technical reference? → docs/reference/
```

### Configuration-Driven Placement
Check `docs-config.js` for the current project's directory structure:

```javascript
// Example categories from docs-config.js
categories: {
  'guides/': 'User and developer guides',
  'api/': 'API reference documentation',
  'features/': 'Feature specifications',
  'setup/': 'Installation and configuration',
  'reference/': 'Technical references'
}
```

### Tools Available
Always use these tools instead of manual documentation management:

1. **docs-validate.js** - Validates all documentation
   ```bash
   node docs-validate.js
   ```

2. **docs-template.js** - Creates new documents from templates
   ```bash
   node docs-template.js
   ```

3. **docs-autoindex.js** - Regenerates documentation index
   ```bash
   node docs-autoindex.js
   ```

### Common Mistakes to Avoid

❌ **Don't do this:**
```
/NEW_FEATURE_PLAN.md
/API_CHANGES.md
/TESTING_RESULTS.md
/HOW_TO_DEPLOY.md
```

✅ **Do this instead:**
```
/docs/development/implementation-plans/NEW_FEATURE_PLAN.md
/docs/api/API_CHANGES.md
/docs/development/test-results/TESTING_RESULTS.md
/docs/setup/deployment/HOW_TO_DEPLOY.md
```

### Template Usage
When creating new documentation, always use the template system:

1. Run `node docs-template.js`
2. Select appropriate template type
3. Fill in the required fields
4. The system will place the file correctly and update the index

Available templates (check docs-config.js for current list):
- **feature**: Feature specifications and requirements
- **guide**: Step-by-step user/developer guides
- **api**: API endpoint documentation
- **setup**: Installation and configuration guides
- **reference**: Technical reference materials

### Validation Workflow
After any documentation changes:

1. **Validate**: `node docs-validate.js`
2. **Fix any errors** reported by the validator
3. **Update index**: `node docs-autoindex.js` (if not auto-updated)
4. **Commit changes** with descriptive message

### File Naming Convention
Check `docs-config.js` for current naming rules. Typically:
- Use UPPERCASE_WITH_UNDERSCORES.md
- Be descriptive but concise
- Avoid special characters except underscores

Examples:
- ✅ `USER_AUTHENTICATION.md`
- ✅ `API_ENDPOINT_REFERENCE.md`
- ❌ `userAuth.md`
- ❌ `api-endpoints.md`

### Index Management
The documentation index is automatically managed:
- **Auto-updated** when using docs-template.js
- **Regenerated** with docs-autoindex.js
- **Validates** with docs-validate.js

Never manually edit the index unless specifically asked.

## 📚 Documentation Philosophy

### Purpose-Based Organization
Documents are organized by **purpose and audience**, not by technology:

- **guides/**: For users learning how to do something
- **api/**: For developers integrating with APIs  
- **features/**: For product managers and developers planning features
- **setup/**: For developers and ops configuring environments
- **reference/**: For developers looking up technical details

### Quality Standards
Every document should have:
1. **Clear title** describing what it covers
2. **Overview section** explaining the purpose
3. **Structured content** using consistent headings
4. **Examples** where applicable
5. **Related documentation** links

### Automation First
Let the tools handle:
- File placement decisions
- Index maintenance  
- Link validation
- Template generation
- Structure validation

Your job is to create great content, not manage file organization.

## 🔧 Troubleshooting

### Common Issues

**"Where should I put this document?"**
- Run `node docs-template.js` and select the appropriate template
- Check the decision tree above
- Look at similar existing documents

**"The validator is reporting errors"**
- Read the error messages carefully - they include suggestions
- Most common: files in wrong location, missing sections, broken links
- Fix the issues and run validation again

**"The index is out of date"**
- Run `node docs-autoindex.js` to regenerate it
- Check if auto-indexing is enabled in docs-config.js

**"I need a custom template"**
- Edit docs-config.js to add new template definitions
- Templates are configuration-driven and fully customizable

### Getting Help
1. Check docs-config.js for project-specific rules
2. Run docs-validate.js to identify issues
3. Look at existing documentation for patterns
4. Use the template system for consistency

## ⚡ Quick Commands

```bash
# Validate all documentation
node docs-validate.js

# Create new document from template
node docs-template.js

# Regenerate documentation index
node docs-autoindex.js

# List available templates
node docs-template.js --list

# Validate with specific config
node docs-validate.js --config=./custom-config.js
```

## 🎯 Remember

**Your goal is to create valuable documentation content.** The system handles organization, validation, and maintenance automatically. Focus on:

1. **Writing clear, helpful content**
2. **Using the right template for the job**
3. **Following the validation feedback**
4. **Keeping documentation up-to-date with code changes**

The documentation system is designed to get out of your way and let you focus on what matters: helping users and developers understand and use the project effectively.

---

**Always validate your work with `docs-validate.js` before considering documentation tasks complete!**