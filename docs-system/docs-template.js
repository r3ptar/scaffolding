#!/usr/bin/env node

/**
 * Documentation Template Generator
 * 
 * Interactive template creation system with validation,
 * smart suggestions, and automatic index integration.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

class TemplateGenerator {
  constructor(configPath = './docs-config.js') {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
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

  // Interactive template selection
  async selectTemplate() {
    console.log(`\n${colors.bold}📝 Documentation Template Generator${colors.reset}`);
    console.log(`Project: ${this.config.project.name}\n`);
    
    const templates = Object.keys(this.config.templates);
    
    console.log('Available templates:');
    templates.forEach((template, index) => {
      const templateConfig = this.config.templates[template];
      console.log(`  ${index + 1}. ${colors.cyan}${templateConfig.name}${colors.reset}`);
      console.log(`     Location: docs/${templateConfig.location}`);
      console.log(`     Purpose: ${templateConfig.sections.slice(0, 3).join(', ')}...`);
    });
    
    const answer = await this.question('\nSelect template (number or name): ');
    
    // Parse selection
    const selectedIndex = parseInt(answer) - 1;
    let selectedTemplate;
    
    if (selectedIndex >= 0 && selectedIndex < templates.length) {
      selectedTemplate = templates[selectedIndex];
    } else {
      selectedTemplate = templates.find(t => 
        t.toLowerCase() === answer.toLowerCase() ||
        this.config.templates[t].name.toLowerCase().includes(answer.toLowerCase())
      );
    }
    
    if (!selectedTemplate) {
      this.log('error', 'Invalid template selection');
      return this.selectTemplate();
    }
    
    return selectedTemplate;
  }

  // Collect template data from user
  async collectTemplateData(templateName) {
    const template = this.config.templates[templateName];
    const data = {};
    
    console.log(`\n${colors.bold}📋 Creating ${template.name}${colors.reset}`);
    console.log(`Will be created in: docs/${template.location}\n`);
    
    // Collect field data
    for (const field of template.fields) {
      await this.collectField(field, data);
    }
    
    // Generate filename
    data.filename = this.generateFilename(data, template);
    data.filepath = path.join('./docs', template.location, data.filename);
    
    // Confirm before creation
    console.log(`\n${colors.cyan}📄 File to create:${colors.reset}`);
    console.log(`  Path: ${data.filepath}`);
    console.log(`  Title: ${data.title}`);
    
    const confirm = await this.question('\nCreate this file? (Y/n): ');
    if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
      this.log('warning', 'Template creation cancelled');
      return null;
    }
    
    return { templateName, data, template };
  }

  async collectField(field, data) {
    let value;
    let attempts = 0;
    const maxAttempts = 3;
    
    do {
      // Show options if available
      let prompt = field.prompt;
      if (field.options) {
        prompt += ` (${field.options.join('/')})`;
      }
      prompt += ' ';
      
      value = await this.question(prompt);
      
      // Handle empty required fields
      if (field.required && !value.trim()) {
        this.log('error', 'This field is required');
        attempts++;
        continue;
      }
      
      // Handle empty optional fields
      if (!value.trim()) {
        break;
      }
      
      // Validate against pattern
      if (field.validation && !field.validation.test(value)) {
        this.log('error', `Invalid format. Expected pattern: ${field.validation}`);
        attempts++;
        continue;
      }
      
      // Validate against options
      if (field.options && !field.options.includes(value.toLowerCase())) {
        this.log('error', `Invalid option. Choose from: ${field.options.join(', ')}`);
        attempts++;
        continue;
      }
      
      break;
      
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      this.log('error', 'Too many invalid attempts');
      process.exit(1);
    }
    
    data[field.key] = value;
  }

  generateFilename(data, template) {
    // Convert title to valid filename
    let filename = data.title
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '_') // Spaces to underscores
      .replace(/_+/g, '_') // Multiple underscores to single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    
    // Ensure it's not too long
    if (filename.length > this.config.naming.maxLength - 3) { // -3 for .md
      filename = filename.substring(0, this.config.naming.maxLength - 3);
    }
    
    // Ensure it follows naming convention
    if (!this.config.naming.regex.test(filename + '.md')) {
      filename = filename.replace(/[^A-Z0-9_]/g, '_');
    }
    
    return filename + '.md';
  }

  // Generate template content
  generateContent(templateName, data, template) {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    
    let content = '';
    
    // Add front matter if enabled
    if (this.config.validation.frontMatter.required) {
      content += '---\n';
      content += `title: "${data.title}"\n`;
      if (data.version) content += `version: ${data.version}\n`;
      content += `created: ${dateString}\n`;
      content += `last_updated: ${dateString}\n`;
      content += `template: ${templateName}\n`;
      content += '---\n\n';
    }
    
    // Add title
    content += `# ${data.title}\n\n`;
    
    // Add metadata section if we have extra data
    const metadataFields = ['version', 'category', 'audience', 'difficulty', 'platform', 'type', 'baseUrl'];
    const metadata = metadataFields.filter(field => data[field]);
    
    if (metadata.length > 0) {
      content += '## Metadata\n\n';
      metadata.forEach(field => {
        const label = field.charAt(0).toUpperCase() + field.slice(1);
        content += `- **${label}**: ${data[field]}\n`;
      });
      content += '\n';
    }
    
    // Add template sections
    template.sections.forEach(section => {
      content += `## ${section}\n\n`;
      
      // Add section-specific placeholder content
      const placeholder = this.getSectionPlaceholder(section, data);
      if (placeholder) {
        content += placeholder + '\n\n';
      } else {
        content += '_TODO: Add content for this section_\n\n';
      }
    });
    
    // Add related documentation section
    if (!template.sections.includes('Related Documentation')) {
      content += '## Related Documentation\n\n';
      content += this.generateRelatedLinks(templateName, data);
    }
    
    return content;
  }

  getSectionPlaceholder(section, data) {
    const placeholders = {
      'Overview': data.description ? data.description : 'Brief overview of this document.',
      'Prerequisites': 'List any requirements or dependencies needed before following this guide.',
      'Usage': 'How to use this feature or follow this guide.',
      'Examples': '```\n// Add code examples here\n```',
      'API Endpoints': '### GET /api/example\n\nDescription of endpoint.\n\n**Parameters:**\n- `param1`: Description\n\n**Response:**\n```json\n{\n  "example": "response"\n}\n```',
      'Authentication': 'Describe authentication requirements and methods.',
      'Installation Steps': '1. First step\n2. Second step\n3. Third step',
      'Configuration': 'Configuration options and settings.',
      'Troubleshooting': '### Common Issues\n\n**Issue 1**: Description\n**Solution**: How to fix it',
      'Testing': 'How to test this feature or implementation.'
    };
    
    return placeholders[section];
  }

  generateRelatedLinks(templateName, data) {
    const suggestions = [];
    
    // Suggest related documentation based on template type
    const relatedSuggestions = {
      feature: ['Setup Guide', 'API Documentation', 'User Guide'],
      guide: ['API Reference', 'Troubleshooting', 'Examples'],
      api: ['User Guide', 'Setup Instructions', 'Authentication'],
      setup: ['User Guide', 'API Documentation', 'Troubleshooting'],
      reference: ['User Guide', 'API Documentation', 'Examples']
    };
    
    const suggested = relatedSuggestions[templateName] || [];
    suggested.forEach(suggestion => {
      suggestions.push(`- [${suggestion}](../${suggestion.toLowerCase().replace(/\s+/g, '_')}.md)`);
    });
    
    if (suggestions.length === 0) {
      suggestions.push('- [Project Overview](../overview/PROJECT_OVERVIEW.md)');
      suggestions.push('- [Documentation Index](../README.md)');
    }
    
    return suggestions.join('\n') + '\n';
  }

  // Create the file and directories
  async createFile(templateResult) {
    const { templateName, data, template } = templateResult;
    
    // Ensure directory exists
    const dir = path.dirname(data.filepath);
    if (!fs.existsSync(dir)) {
      this.log('info', `Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Check if file already exists
    if (fs.existsSync(data.filepath)) {
      const overwrite = await this.question(`\n${colors.yellow}File already exists. Overwrite? (y/N): ${colors.reset}`);
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        this.log('warning', 'File creation cancelled');
        return false;
      }
    }
    
    // Generate content
    const content = this.generateContent(templateName, data, template);
    
    try {
      // Write file
      fs.writeFileSync(data.filepath, content, 'utf8');
      this.log('success', `✅ Created: ${data.filepath}`);
      
      // Update index if automation is enabled
      if (this.config.automation.templateGeneration.updateIndex) {
        await this.updateIndex(data);
      }
      
      return true;
      
    } catch (error) {
      this.log('error', `Failed to create file: ${error.message}`);
      return false;
    }
  }

  // Update documentation index
  async updateIndex(data) {
    const indexPath = './docs/README.md';
    
    if (!fs.existsSync(indexPath)) {
      this.log('warning', 'Documentation index not found, skipping update');
      return;
    }
    
    try {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const relativePath = path.relative('./docs', data.filepath);
      
      // Check if already in index
      if (indexContent.includes(relativePath)) {
        this.log('info', 'File already referenced in index');
        return;
      }
      
      // Simple index update - just add to end of relevant section
      const newEntry = `- **[${data.title}](${relativePath})**`;
      const updatedContent = indexContent + '\n' + newEntry;
      
      fs.writeFileSync(indexPath, updatedContent, 'utf8');
      this.log('success', '📚 Updated documentation index');
      
    } catch (error) {
      this.log('warning', `Could not update index: ${error.message}`);
    }
  }

  // Utility method for asking questions
  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  // Main generation process
  async generate() {
    try {
      const templateName = await this.selectTemplate();
      const templateResult = await this.collectTemplateData(templateName);
      
      if (!templateResult) {
        this.rl.close();
        return;
      }
      
      const success = await this.createFile(templateResult);
      
      if (success) {
        console.log(`\n${colors.green}🎉 Template created successfully!${colors.reset}`);
        console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
        console.log(`1. Edit the content in ${templateResult.data.filepath}`);
        console.log(`2. Add specific details to each section`);
        console.log(`3. Run docs-validate.js to check for issues`);
        console.log(`4. Update related documentation with cross-references`);
      }
      
    } catch (error) {
      this.log('error', `Template generation failed: ${error.message}`);
    } finally {
      this.rl.close();
    }
  }

  // Show template information without creating
  showTemplateInfo() {
    console.log(`\n${colors.bold}📝 Available Templates${colors.reset}\n`);
    
    Object.entries(this.config.templates).forEach(([key, template]) => {
      console.log(`${colors.cyan}${template.name}${colors.reset}`);
      console.log(`  Location: docs/${template.location}`);
      console.log(`  Fields: ${template.fields.map(f => f.key).join(', ')}`);
      console.log(`  Sections: ${template.sections.join(', ')}`);
      console.log('');
    });
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1] || './docs-config.js';
  
  const generator = new TemplateGenerator(configPath);
  
  if (args.includes('--list') || args.includes('-l')) {
    generator.showTemplateInfo();
  } else {
    generator.generate();
  }
}

module.exports = TemplateGenerator;