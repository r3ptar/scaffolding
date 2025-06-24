#!/bin/bash

# Documentation System Installation Script
# Usage: ./install-docs-system.sh [target-directory]

set -e

TARGET_DIR=${1:-"."}
DOCS_DIR="$TARGET_DIR/docs"
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📚 Installing Documentation System..."
echo "Target directory: $TARGET_DIR"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p "$DOCS_DIR"
mkdir -p "$TARGET_DIR/scripts"

# Copy core system files
echo "📋 Copying documentation system files..."

# Core scripts
cp "$CURRENT_DIR/docs-config.js" "$TARGET_DIR/"
cp "$CURRENT_DIR/docs-validate.js" "$TARGET_DIR/scripts/"
cp "$CURRENT_DIR/docs-template.js" "$TARGET_DIR/scripts/"
cp "$CURRENT_DIR/docs-autoindex.js" "$TARGET_DIR/scripts/"

# Documentation
cp "$CURRENT_DIR/docs-guide.md" "$DOCS_DIR/"
cp "$CURRENT_DIR/README.md" "$DOCS_DIR/"

# Make scripts executable
chmod +x "$TARGET_DIR/scripts/docs-validate.js"
chmod +x "$TARGET_DIR/scripts/docs-template.js"
chmod +x "$TARGET_DIR/scripts/docs-autoindex.js"

# Create initial documentation structure based on config
echo "🏗️  Creating initial documentation structure..."

# Read configuration and create directories
node -e "
const config = require('$TARGET_DIR/docs-config.js');
const fs = require('fs');
const path = require('path');

Object.keys(config.categories).forEach(category => {
  const categoryPath = path.join('$DOCS_DIR', category);
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
    console.log('  Created:', category);
    
    // Create placeholder README in each category
    const readmeContent = \`# \${category.charAt(0).toUpperCase() + category.slice(1).replace('/', '')}

\${config.categories[category].description || 'Documentation files'}

## Contents

This directory contains:
- \${config.categories[category].purpose || 'Various documentation files'}

## Adding Documentation

Use the template system to create new documentation:

\\\`\\\`\\\`bash
node scripts/docs-template.js
\\\`\\\`\\\`

Select the appropriate template for this category.
\`;
    
    fs.writeFileSync(path.join(categoryPath, 'README.md'), readmeContent);
  }
});
"

# Create package.json scripts if package.json exists
if [ -f "$TARGET_DIR/package.json" ]; then
  echo "📦 Adding npm scripts to package.json..."
  
  # Backup package.json
  cp "$TARGET_DIR/package.json" "$TARGET_DIR/package.json.backup"
  
  # Add documentation scripts
  node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$TARGET_DIR/package.json', 'utf8'));

if (!pkg.scripts) pkg.scripts = {};

pkg.scripts['docs:validate'] = 'node scripts/docs-validate.js';
pkg.scripts['docs:template'] = 'node scripts/docs-template.js';
pkg.scripts['docs:index'] = 'node scripts/docs-autoindex.js';
pkg.scripts['docs:setup'] = 'npm run docs:index && npm run docs:validate';

fs.writeFileSync('$TARGET_DIR/package.json', JSON.stringify(pkg, null, 2));
console.log('  Added npm scripts for documentation management');
"
fi

# Generate initial documentation index
echo "📚 Generating initial documentation index..."
cd "$TARGET_DIR"
node scripts/docs-autoindex.js

# Run initial validation
echo "🔍 Running initial validation..."
node scripts/docs-validate.js

# Setup git hooks if .git directory exists
if [ -d "$TARGET_DIR/.git" ]; then
  echo "⚙️  Setting up git hooks..."
  
  HOOKS_DIR="$TARGET_DIR/.git/hooks"
  PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"
  
  # Create or append to pre-commit hook
  if [ -f "$PRE_COMMIT_HOOK" ]; then
    echo "" >> "$PRE_COMMIT_HOOK"
    echo "# Documentation validation" >> "$PRE_COMMIT_HOOK"
    echo "node scripts/docs-validate.js" >> "$PRE_COMMIT_HOOK"
    echo "if [ \$? -ne 0 ]; then" >> "$PRE_COMMIT_HOOK"
    echo "  echo 'Documentation validation failed. Fix issues before committing.'" >> "$PRE_COMMIT_HOOK"
    echo "  exit 1" >> "$PRE_COMMIT_HOOK"
    echo "fi" >> "$PRE_COMMIT_HOOK"
  else
    cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/sh
# Documentation validation
echo "🔍 Validating documentation..."
node scripts/docs-validate.js
if [ $? -ne 0 ]; then
  echo "❌ Documentation validation failed. Fix issues before committing."
  exit 1
fi
echo "✅ Documentation validation passed"
EOF
  fi
  
  chmod +x "$PRE_COMMIT_HOOK"
  echo "  Created pre-commit hook for documentation validation"
fi

# Create .gitignore entries if .gitignore exists
if [ -f "$TARGET_DIR/.gitignore" ]; then
  echo "📝 Updating .gitignore..."
  
  if ! grep -q "docs/README.md.backup" "$TARGET_DIR/.gitignore"; then
    echo "" >> "$TARGET_DIR/.gitignore"
    echo "# Documentation system backups" >> "$TARGET_DIR/.gitignore"
    echo "docs/README.md.backup" >> "$TARGET_DIR/.gitignore"
    echo "package.json.backup" >> "$TARGET_DIR/.gitignore"
  fi
fi

# Update main project README if it exists
if [ -f "$TARGET_DIR/README.md" ]; then
  echo "📖 Checking main README for documentation links..."
  
  if ! grep -q "Documentation" "$TARGET_DIR/README.md"; then
    echo "
## 📚 Documentation

This project uses an automated documentation system.

**Documentation Hub**: [docs/README.md](docs/README.md)

### Quick Commands
\`\`\`bash
# Create new documentation
npm run docs:template

# Validate all documentation  
npm run docs:validate

# Regenerate documentation index
npm run docs:index
\`\`\`

### For AI Assistants
See [docs/docs-guide.md](docs/docs-guide.md) for documentation rules and guidelines.
" >> "$TARGET_DIR/README.md"
    echo "  Added documentation section to main README"
  fi
fi

echo ""
echo "✅ Documentation system installed successfully!"
echo ""
echo "📋 What was installed:"
echo "  • Configuration: docs-config.js"
echo "  • Validation: scripts/docs-validate.js"
echo "  • Templates: scripts/docs-template.js"
echo "  • Auto-indexing: scripts/docs-autoindex.js"
echo "  • AI guide: docs/docs-guide.md"
echo "  • Documentation hub: docs/README.md"
echo ""
echo "📊 Current status:"

# Count files and categories
DOCS_COUNT=$(find "$DOCS_DIR" -name "*.md" | wc -l)
CATEGORY_COUNT=$(find "$DOCS_DIR" -type d -mindepth 1 | wc -l)

echo "  • Documentation files: $DOCS_COUNT"
echo "  • Categories: $CATEGORY_COUNT" 
echo "  • Validation: $(cd "$TARGET_DIR" && node scripts/docs-validate.js > /dev/null 2>&1 && echo "✅ PASS" || echo "⚠️  WARNINGS")"
echo ""
echo "🚀 Next steps:"
echo "1. Edit docs-config.js to customize for your project"
echo "2. Create your first document: npm run docs:template"
echo "3. Validate everything: npm run docs:validate"
echo "4. Commit the documentation system to version control"
echo ""
echo "💡 Quick start commands:"
echo "  npm run docs:template  # Create new documentation"
echo "  npm run docs:validate  # Check for issues"
echo "  npm run docs:index     # Regenerate index"
echo ""
echo "📚 Documentation: docs/README.md"
echo "⚙️  Configuration: docs-config.js"
echo "🤖 AI Guide: docs/docs-guide.md"

# Return to original directory
cd "$CURRENT_DIR"