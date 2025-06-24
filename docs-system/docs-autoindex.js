#!/usr/bin/env node

/**
 * Documentation Auto-Index Generator
 * 
 * Automatically generates and maintains documentation indexes
 * with categorization, metadata, and navigation.
 */

const fs = require('fs');
const path = require('path');

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

class AutoIndexGenerator {
  constructor(configPath = './docs-config.js') {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.docTree = {};
    this.stats = {
      filesIndexed: 0,
      categoriesFound: 0,
      linksGenerated: 0
    };
  }

  loadConfig() {
    try {
      const fullPath = path.resolve(this.configPath);
      delete require.cache[fullPath]; // Clear cache for fresh config
      return require(fullPath);
    } catch (error) {
      console.error(`${colors.red}Failed to load configuration: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  log(level, message) {
    const levelColors = {
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue,
      success: colors.green
    };
    
    const color = levelColors[level] || colors.reset;
    console.log(`${color}${message}${colors.reset}`);
  }

  // Scan documentation directory and build tree
  scanDocumentation() {
    this.log('info', '📁 Scanning documentation directory...');
    
    const docsDir = './docs';
    if (!fs.existsSync(docsDir)) {
      this.log('error', 'Documentation directory does not exist');
      return false;
    }
    
    this.docTree = this.buildDocTree(docsDir);
    this.log('success', `Found ${this.stats.filesIndexed} documentation files in ${this.stats.categoriesFound} categories`);
    
    return true;
  }

  buildDocTree(dir, category = '') {
    const tree = {};
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          // Handle subdirectories
          const subCategory = category ? `${category}/${item.name}` : item.name;
          tree[item.name] = {
            type: 'directory',
            path: itemPath,
            category: subCategory,
            children: this.buildDocTree(itemPath, subCategory),
            description: this.getCategoryDescription(item.name + '/')
          };
          this.stats.categoriesFound++;
          
        } else if (item.name.endsWith('.md') && item.name !== 'README.md') {
          // Handle markdown files
          const fileInfo = this.extractFileInfo(itemPath);
          tree[item.name] = {
            type: 'file',
            path: itemPath,
            category: category,
            ...fileInfo
          };
          this.stats.filesIndexed++;
        }
      }
      
    } catch (error) {
      this.log('warning', `Error scanning ${dir}: ${error.message}`);
    }
    
    return tree;
  }

  getCategoryDescription(categoryPath) {
    return this.config.categories[categoryPath]?.description || 'Documentation files';
  }

  // Extract metadata from markdown files
  extractFileInfo(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Extract title (first H1)
      let title = path.basename(filePath, '.md');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1];
      }
      
      // Extract front matter if present
      let frontMatter = {};
      if (content.startsWith('---\n')) {
        const frontMatterEnd = content.indexOf('\n---\n', 4);
        if (frontMatterEnd > 0) {
          const frontMatterText = content.slice(4, frontMatterEnd);
          frontMatter = this.parseFrontMatter(frontMatterText);
        }
      }
      
      // Extract description (first paragraph or overview section)
      let description = this.extractDescription(content);
      
      // Get file stats
      const stats = fs.statSync(filePath);
      
      return {
        title,
        description,
        lastModified: stats.mtime,
        size: stats.size,
        ...frontMatter
      };
      
    } catch (error) {
      this.log('warning', `Error reading ${filePath}: ${error.message}`);
      return {
        title: path.basename(filePath, '.md'),
        description: 'Documentation file',
        lastModified: new Date(),
        size: 0
      };
    }
  }

  parseFrontMatter(text) {
    const result = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        result[match[1].trim()] = value;
      }
    }
    
    return result;
  }

  extractDescription(content) {
    // Remove front matter
    let text = content;
    if (text.startsWith('---\n')) {
      const frontMatterEnd = text.indexOf('\n---\n', 4);
      if (frontMatterEnd > 0) {
        text = text.slice(frontMatterEnd + 5);
      }
    }
    
    // Skip title
    const lines = text.split('\n');
    let startIndex = 0;
    if (lines[0].startsWith('# ')) {
      startIndex = 1;
    }
    
    // Look for overview section or first paragraph
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('## Overview') || line.startsWith('## Description')) {
        // Found overview section, get next non-empty line
        for (let j = i + 1; j < lines.length; j++) {
          const paraLine = lines[j].trim();
          if (paraLine && !paraLine.startsWith('#') && !paraLine.startsWith('_') && !paraLine.startsWith('-')) {
            return paraLine.length > 100 ? paraLine.substring(0, 97) + '...' : paraLine;
          }
        }
      }
      
      // First substantial paragraph
      if (line && !line.startsWith('#') && !line.startsWith('_') && !line.startsWith('-') && line.length > 20) {
        return line.length > 100 ? line.substring(0, 97) + '...' : line;
      }
    }
    
    return 'Documentation file';
  }

  // Generate index content
  generateIndexContent() {
    this.log('info', '📝 Generating index content...');
    
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    
    let content = `# ${this.config.project.name} - Documentation Index\n\n`;
    content += `_Last updated: ${dateString}_\n\n`;
    
    // Quick links section
    content += this.generateQuickLinks();
    
    // Table of contents
    content += this.generateTableOfContents();
    
    // Main sections
    content += this.generateMainSections();
    
    // Statistics
    if (this.config.automation.autoIndex.includeMetadata) {
      content += this.generateStatistics();
    }
    
    this.stats.linksGenerated = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    
    return content;
  }

  generateQuickLinks() {
    let content = '## 🏠 Quick Links\n\n';
    
    // Standard project links
    content += '- **[Project README](../README.md)** - Project overview and quick start\n';
    
    if (fs.existsSync('./CLAUDE.md')) {
      content += '- **[CLAUDE.md](../CLAUDE.md)** - AI assistant context and priorities\n';
    }
    
    // Quick access to major sections
    const majorSections = Object.keys(this.config.categories).slice(0, 4);
    majorSections.forEach(category => {
      const categoryName = category.replace('/', '');
      const categoryDesc = this.config.categories[category]?.description || categoryName;
      content += `- **[${this.capitalize(categoryName)}](#${categoryName.toLowerCase()})** - ${categoryDesc}\n`;
    });
    
    content += '\n';
    return content;
  }

  generateTableOfContents() {
    let content = '## 📁 Documentation Structure\n\n';
    
    const categories = Object.keys(this.config.categories);
    categories.forEach(category => {
      const categoryName = category.replace('/', '');
      const emoji = this.getCategoryEmoji(categoryName);
      content += `- [${emoji} ${this.capitalize(categoryName)}](#${categoryName.toLowerCase()})\n`;
    });
    
    content += '\n';
    return content;
  }

  generateMainSections() {
    let content = '';
    
    // Group files by category
    const categorizedDocs = this.categorizeDocuments();
    
    Object.entries(categorizedDocs).forEach(([category, docs]) => {
      if (docs.length === 0) return;
      
      const categoryName = category || 'uncategorized';
      const categoryConfig = this.config.categories[category + '/'];
      const emoji = this.getCategoryEmoji(categoryName);
      
      content += `## ${emoji} ${this.capitalize(categoryName)}\n`;
      
      if (categoryConfig?.description) {
        content += `_${categoryConfig.description}_\n`;
      }
      
      content += '\n';
      
      // Sort documents by title
      const sortedDocs = docs.sort((a, b) => a.title.localeCompare(b.title));
      
      // Group by subdirectory if present
      const grouped = this.groupBySubdirectory(sortedDocs);
      
      Object.entries(grouped).forEach(([subdir, subdocs]) => {
        if (subdir && subdir !== '.') {
          content += `### ${this.capitalize(subdir)}\n\n`;
        }
        
        subdocs.forEach(doc => {
          const relativePath = path.relative('./docs', doc.path);
          content += `- **[${doc.title}](${relativePath})**`;
          
          if (doc.description && doc.description !== 'Documentation file') {
            content += ` - ${doc.description}`;
          }
          
          content += '\n';
        });
        
        content += '\n';
      });
    });
    
    return content;
  }

  categorizeDocuments() {
    const categorized = {};
    
    // Initialize categories
    Object.keys(this.config.categories).forEach(category => {
      categorized[category.replace('/', '')] = [];
    });
    categorized['uncategorized'] = [];
    
    // Categorize documents
    this.flattenDocTree(this.docTree).forEach(doc => {
      if (doc.type === 'file') {
        const category = doc.category || 'uncategorized';
        const categoryKey = category.split('/')[0] || 'uncategorized';
        
        if (!categorized[categoryKey]) {
          categorized[categoryKey] = [];
        }
        
        categorized[categoryKey].push(doc);
      }
    });
    
    return categorized;
  }

  groupBySubdirectory(docs) {
    const grouped = {};
    
    docs.forEach(doc => {
      const categoryParts = (doc.category || '').split('/');
      const subdir = categoryParts.length > 1 ? categoryParts[1] : '.';
      
      if (!grouped[subdir]) {
        grouped[subdir] = [];
      }
      
      grouped[subdir].push(doc);
    });
    
    return grouped;
  }

  flattenDocTree(tree, result = []) {
    Object.values(tree).forEach(item => {
      if (item.type === 'file') {
        result.push(item);
      } else if (item.type === 'directory' && item.children) {
        this.flattenDocTree(item.children, result);
      }
    });
    
    return result;
  }

  generateStatistics() {
    let content = '## 📊 Documentation Statistics\n\n';
    
    content += `- **Total Files**: ${this.stats.filesIndexed}\n`;
    content += `- **Categories**: ${this.stats.categoriesFound}\n`;
    content += `- **Links**: ${this.stats.linksGenerated}\n`;
    content += `- **Last Scan**: ${new Date().toISOString()}\n`;
    
    // File size statistics
    const allDocs = this.flattenDocTree(this.docTree).filter(doc => doc.type === 'file');
    if (allDocs.length > 0) {
      const totalSize = allDocs.reduce((sum, doc) => sum + doc.size, 0);
      const avgSize = Math.round(totalSize / allDocs.length);
      
      content += `- **Total Size**: ${this.formatBytes(totalSize)}\n`;
      content += `- **Average Size**: ${this.formatBytes(avgSize)}\n`;
    }
    
    content += '\n';
    return content;
  }

  // Utility methods
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  getCategoryEmoji(category) {
    const emojis = {
      guides: '📖',
      api: '🔌',
      features: '🎮',
      setup: '⚙️',
      reference: '📚',
      development: '🔨',
      overview: '🌐',
      tutorials: '🎓',
      examples: '💡',
      troubleshooting: '🔧',
      architecture: '🏗️',
      deployment: '🚀'
    };
    
    return emojis[category.toLowerCase()] || '📄';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Write index file
  writeIndex(content) {
    const indexPath = './docs/README.md';
    
    try {
      // Backup existing index if it exists
      if (fs.existsSync(indexPath)) {
        const backupPath = indexPath + '.backup';
        fs.copyFileSync(indexPath, backupPath);
        this.log('info', `Backed up existing index to ${backupPath}`);
      }
      
      // Write new index
      fs.writeFileSync(indexPath, content, 'utf8');
      this.log('success', `✅ Generated documentation index: ${indexPath}`);
      
      return true;
      
    } catch (error) {
      this.log('error', `Failed to write index: ${error.message}`);
      return false;
    }
  }

  // Main generation process
  async generate() {
    console.log(`${colors.bold}📚 Auto-Index Generator${colors.reset}`);
    console.log(`Project: ${this.config.project.name}\n`);
    
    try {
      // Scan documentation
      if (!this.scanDocumentation()) {
        return false;
      }
      
      // Generate content
      const content = this.generateIndexContent();
      
      // Write index
      const success = this.writeIndex(content);
      
      if (success) {
        console.log(`\n${colors.green}🎉 Index generated successfully!${colors.reset}`);
        console.log(`\n${colors.cyan}Statistics:${colors.reset}`);
        console.log(`  Files indexed: ${this.stats.filesIndexed}`);
        console.log(`  Categories found: ${this.stats.categoriesFound}`);
        console.log(`  Links generated: ${this.stats.linksGenerated}`);
        
        console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
        console.log(`1. Review the generated index at docs/README.md`);
        console.log(`2. Run docs-validate.js to check for any issues`);
        console.log(`3. Commit the updated index to version control`);
      }
      
      return success;
      
    } catch (error) {
      this.log('error', `Index generation failed: ${error.message}`);
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1] || './docs-config.js';
  
  const generator = new AutoIndexGenerator(configPath);
  
  generator.generate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error(`${colors.red}Generation error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = AutoIndexGenerator;