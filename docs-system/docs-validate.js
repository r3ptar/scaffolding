#!/usr/bin/env node

/**
 * Documentation System Validator
 * 
 * Comprehensive validation suite for documentation structure,
 * content, links, and compliance with project standards.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class DocumentationValidator {
  constructor(configPath = './docs-config.js') {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.issues = {
      errors: [],
      warnings: [],
      info: []
    };
    this.stats = {
      filesChecked: 0,
      linksValidated: 0,
      directoriesScanned: 0
    };
  }

  loadConfig() {
    try {
      const fullPath = path.resolve(this.configPath);
      delete require.cache[fullPath]; // Clear cache for fresh config
      return require(fullPath);
    } catch (error) {
      this.log('error', `Failed to load configuration from ${this.configPath}: ${error.message}`);
      process.exit(1);
    }
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const levelColors = {
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue,
      success: colors.green
    };
    
    const color = levelColors[level] || colors.reset;
    console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`);
  }

  addIssue(level, file, issue, suggestion = null) {
    const issueObj = {
      file,
      issue,
      suggestion,
      timestamp: new Date().toISOString()
    };
    
    this.issues[level + 's'].push(issueObj);
    
    if (level === 'error') {
      this.log('error', `${file}: ${issue}`);
      if (suggestion) this.log('info', `  💡 Suggestion: ${suggestion}`);
    } else if (level === 'warning') {
      this.log('warning', `${file}: ${issue}`);
      if (suggestion) this.log('info', `  💡 Suggestion: ${suggestion}`);
    }
  }

  // Validate root directory compliance
  validateRootDirectory() {
    this.log('info', '📁 Validating root directory structure...');
    
    const rootFiles = fs.readdirSync('.').filter(file => 
      fs.statSync(file).isFile() && file.endsWith('.md')
    );

    // Check for too many files
    if (rootFiles.length > this.config.rootDirectory.maxFiles) {
      this.addIssue('error', './', 
        `Too many files in root directory (${rootFiles.length}/${this.config.rootDirectory.maxFiles})`,
        'Move documentation files to docs/ subdirectories'
      );
    }

    // Check for forbidden files
    for (const file of rootFiles) {
      if (!this.config.rootDirectory.allowedFiles.includes(file)) {
        const isForbidden = this.config.rootDirectory.forbiddenPatterns.some(
          pattern => pattern.test(file)
        );
        
        if (isForbidden) {
          this.addIssue('error', file,
            'Forbidden file pattern in root directory',
            `Move to appropriate docs/ subdirectory`
          );
        } else if (!this.config.rootDirectory.allowedFiles.includes(file)) {
          this.addIssue('warning', file,
            'Unexpected file in root directory',
            'Consider moving to docs/ if it\'s documentation'
          );
        }
      }
    }
  }

  // Validate directory structure and organization
  validateDirectoryStructure() {
    this.log('info', '🗂️  Validating directory structure...');
    
    const docsDir = './docs';
    if (!fs.existsSync(docsDir)) {
      this.addIssue('error', docsDir, 
        'Documentation directory does not exist',
        'Create docs/ directory and organize documentation'
      );
      return;
    }

    // Check for required categories
    const expectedCategories = Object.keys(this.config.categories);
    const existingDirs = fs.readdirSync(docsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name + '/');

    for (const category of expectedCategories) {
      if (!existingDirs.includes(category)) {
        this.addIssue('warning', `docs/${category}`,
          'Expected category directory does not exist',
          `Create docs/${category} for ${this.config.categories[category].description}`
        );
      }
    }

    this.stats.directoriesScanned = existingDirs.length;
  }

  // Validate file naming conventions
  validateNamingConventions() {
    this.log('info', '📝 Validating file naming conventions...');
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.md')) {
          this.stats.filesChecked++;
          
          // Check naming convention
          if (!this.config.naming.regex.test(file)) {
            const correctName = file
              .replace(/[^a-zA-Z0-9_]/g, '_')
              .replace(/_+/g, '_')
              .toUpperCase();
            
            this.addIssue('warning', filePath,
              'File name does not follow naming convention',
              `Rename to ${correctName}`
            );
          }
          
          // Check file name length
          if (file.length > this.config.naming.maxLength) {
            this.addIssue('warning', filePath,
              `File name too long (${file.length}/${this.config.naming.maxLength} chars)`,
              'Use shorter, more concise name'
            );
          }
        }
      }
    };

    if (fs.existsSync('./docs')) {
      walkDir('./docs');
    }
  }

  // Validate document content structure
  validateContentStructure() {
    this.log('info', '📄 Validating document content structure...');
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.md')) {
          this.validateDocumentContent(filePath);
        }
      }
    };

    if (fs.existsSync('./docs')) {
      walkDir('./docs');
    }
  }

  validateDocumentContent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Check for required sections
      const sections = this.extractSections(content);
      
      for (const requiredSection of this.config.validation.requiredSections) {
        if (!sections.includes(requiredSection)) {
          this.addIssue('warning', filePath,
            `Missing required section: ${requiredSection}`,
            `Add ## ${requiredSection} section to document`
          );
        }
      }
      
      // Check for title (first line should be # Title)
      if (lines.length > 0 && !lines[0].startsWith('# ')) {
        this.addIssue('warning', filePath,
          'Document should start with # Title',
          'Add a proper title as the first line'
        );
      }
      
      // Check for empty documents
      if (content.trim().length < 50) {
        this.addIssue('warning', filePath,
          'Document appears to be empty or too short',
          'Add meaningful content to the document'
        );
      }
      
    } catch (error) {
      this.addIssue('error', filePath,
        `Error reading file: ${error.message}`,
        'Check file permissions and encoding'
      );
    }
  }

  extractSections(content) {
    const sectionRegex = /^## (.+)$/gm;
    const sections = [];
    let match;
    
    while ((match = sectionRegex.exec(content)) !== null) {
      sections.push(match[1].trim());
    }
    
    return sections;
  }

  // Validate internal links
  validateInternalLinks() {
    if (!this.config.validation.linkValidation.checkInternal) {
      return;
    }
    
    this.log('info', '🔗 Validating internal links...');
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.md')) {
          this.validateLinksInFile(filePath);
        }
      }
    };

    if (fs.existsSync('./docs')) {
      walkDir('./docs');
    }
  }

  validateLinksInFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const linkText = match[1];
        const linkUrl = match[2];
        this.stats.linksValidated++;
        
        // Skip external links if not checking them
        if (linkUrl.startsWith('http')) {
          continue;
        }
        
        // Resolve relative path
        const linkPath = path.resolve(path.dirname(filePath), linkUrl);
        
        if (!fs.existsSync(linkPath)) {
          this.addIssue('error', filePath,
            `Broken internal link: ${linkUrl} (text: "${linkText}")`,
            'Update link path or create missing file'
          );
        }
      }
    } catch (error) {
      this.addIssue('error', filePath,
        `Error validating links: ${error.message}`,
        'Check file permissions and encoding'
      );
    }
  }

  // Validate index completeness
  validateIndex() {
    this.log('info', '📚 Validating documentation index...');
    
    const indexPath = './docs/README.md';
    if (!fs.existsSync(indexPath)) {
      this.addIssue('error', indexPath,
        'Documentation index (docs/README.md) does not exist',
        'Create documentation index with links to all docs'
      );
      return;
    }
    
    // Get all documentation files
    const allDocs = this.getAllDocumentationFiles();
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check if all docs are referenced in index
    const missingFromIndex = allDocs.filter(doc => {
      const relativePath = path.relative('./docs', doc);
      return !indexContent.includes(relativePath);
    });
    
    if (missingFromIndex.length > 0) {
      this.addIssue('warning', indexPath,
        `${missingFromIndex.length} documentation files not referenced in index`,
        'Run docs-autoindex.js to update the index'
      );
    }
  }

  getAllDocumentationFiles() {
    const docs = [];
    
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.md') && file !== 'README.md') {
          docs.push(filePath);
        }
      }
    };
    
    walkDir('./docs');
    return docs;
  }

  // Generate validation report
  generateReport() {
    this.log('info', '📊 Generating validation report...');
    
    const totalIssues = this.issues.errors.length + this.issues.warnings.length;
    
    console.log(`\n${colors.bold}📋 Documentation Validation Report${colors.reset}`);
    console.log('=' .repeat(50));
    
    // Statistics
    console.log(`\n${colors.cyan}📊 Statistics:${colors.reset}`);
    console.log(`  Files checked: ${this.stats.filesChecked}`);
    console.log(`  Links validated: ${this.stats.linksValidated}`);
    console.log(`  Directories scanned: ${this.stats.directoriesScanned}`);
    
    // Issues summary
    console.log(`\n${colors.cyan}🚨 Issues Summary:${colors.reset}`);
    console.log(`  ${colors.red}Errors: ${this.issues.errors.length}${colors.reset}`);
    console.log(`  ${colors.yellow}Warnings: ${this.issues.warnings.length}${colors.reset}`);
    console.log(`  ${colors.blue}Info: ${this.issues.info.length}${colors.reset}`);
    
    // Error details
    if (this.issues.errors.length > 0) {
      console.log(`\n${colors.red}❌ Errors (must fix):${colors.reset}`);
      this.issues.errors.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.file}: ${issue.issue}`);
        if (issue.suggestion) {
          console.log(`     💡 ${issue.suggestion}`);
        }
      });
    }
    
    // Warning details (only show first 10 to avoid spam)
    if (this.issues.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️  Warnings (should fix):${colors.reset}`);
      const warningsToShow = this.issues.warnings.slice(0, 10);
      warningsToShow.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.file}: ${issue.issue}`);
        if (issue.suggestion) {
          console.log(`     💡 ${issue.suggestion}`);
        }
      });
      
      if (this.issues.warnings.length > 10) {
        console.log(`  ... and ${this.issues.warnings.length - 10} more warnings`);
      }
    }
    
    // Overall result
    console.log('\n' + '='.repeat(50));
    if (this.issues.errors.length === 0) {
      console.log(`${colors.green}✅ Documentation validation passed!${colors.reset}`);
      if (this.issues.warnings.length > 0) {
        console.log(`${colors.yellow}⚠️  ${this.issues.warnings.length} warnings to address${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ Documentation validation failed with ${this.issues.errors.length} errors${colors.reset}`);
    }
    
    return this.issues.errors.length === 0;
  }

  // Main validation method
  async validate() {
    console.log(`${colors.bold}🔍 Starting Documentation Validation${colors.reset}`);
    console.log(`Config: ${this.configPath}`);
    console.log(`Project: ${this.config.project.name} (${this.config.project.type})`);
    console.log('');
    
    try {
      this.validateRootDirectory();
      this.validateDirectoryStructure();
      this.validateNamingConventions();
      this.validateContentStructure();
      this.validateInternalLinks();
      this.validateIndex();
      
      return this.generateReport();
    } catch (error) {
      this.log('error', `Validation failed: ${error.message}`);
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const configPath = process.argv[2] || './docs-config.js';
  const validator = new DocumentationValidator(configPath);
  
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error(`${colors.red}Validation error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = DocumentationValidator;