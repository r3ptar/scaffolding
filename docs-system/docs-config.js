#!/usr/bin/env node

/**
 * Documentation System Configuration
 * 
 * Project-agnostic documentation system configuration.
 * Customize this file for your specific project needs.
 */

module.exports = {
  // Project Information
  project: {
    name: 'Your Project Name',
    type: 'web-app', // web-app, game, library, mobile-app
    version: '1.0.0'
  },

  // Directory Structure Configuration
  categories: {
    'guides/': {
      description: 'User and developer guides',
      purpose: 'Step-by-step instructions and tutorials',
      audience: 'users, developers',
      examples: ['GETTING_STARTED.md', 'API_USAGE_GUIDE.md']
    },
    'api/': {
      description: 'API reference documentation',
      purpose: 'Technical API specifications',
      audience: 'developers',
      examples: ['ENDPOINTS.md', 'AUTHENTICATION.md']
    },
    'features/': {
      description: 'Feature specifications',
      purpose: 'Feature design and requirements',
      audience: 'product, developers',
      examples: ['USER_AUTHENTICATION.md', 'PAYMENT_SYSTEM.md']
    },
    'setup/': {
      description: 'Installation and configuration',
      purpose: 'Environment setup and deployment',
      audience: 'developers, ops',
      examples: ['LOCAL_DEVELOPMENT.md', 'PRODUCTION_DEPLOYMENT.md']
    },
    'reference/': {
      description: 'Technical references',
      purpose: 'Detailed technical specifications',
      audience: 'developers',
      examples: ['DATABASE_SCHEMA.md', 'CONFIGURATION_OPTIONS.md']
    }
  },

  // Naming Conventions
  naming: {
    pattern: 'UPPERCASE_WITH_UNDERSCORES.md',
    regex: /^[A-Z0-9_]+\.md$/,
    maxLength: 50,
    examples: {
      good: ['USER_GUIDE.md', 'API_REFERENCE.md', 'SETUP_INSTRUCTIONS.md'],
      bad: ['userGuide.md', 'api-reference.md', 'setup instructions.md']
    }
  },

  // Root Directory Rules
  rootDirectory: {
    maxFiles: 5,
    allowedFiles: [
      'README.md',
      'LICENSE',
      'CLAUDE.md',
      'CONTRIBUTING.md',
      'CHANGELOG.md'
    ],
    allowedExtensions: ['.md', '.txt', '.json', '.yml', '.yaml'],
    forbiddenPatterns: [
      /.*GUIDE.*\.md$/,
      /.*DOCS.*\.md$/,
      /.*INSTRUCTIONS.*\.md$/
    ]
  },

  // Validation Rules
  validation: {
    requiredSections: [
      'Overview',
      'Usage'
    ],
    optionalSections: [
      'Table of Contents',
      'Examples',
      'Related Documentation',
      'Troubleshooting'
    ],
    linkValidation: {
      checkInternal: true,
      checkExternal: false, // Can be slow
      allowedDomains: [], // Whitelist for external links
      relativePaths: true
    },
    frontMatter: {
      required: false,
      fields: ['title', 'version', 'last_updated']
    }
  },

  // Template Definitions
  templates: {
    feature: {
      name: 'Feature Documentation',
      location: 'features/',
      fields: [
        { key: 'title', prompt: 'Feature name:', required: true },
        { key: 'version', prompt: 'Version introduced:', validation: /^\d+\.\d+\.\d+$/ },
        { key: 'description', prompt: 'Brief description:', required: true },
        { key: 'category', prompt: 'Category:', options: ['ui', 'api', 'backend', 'frontend'] }
      ],
      sections: [
        'Overview',
        'Requirements',
        'Implementation Details',
        'API Endpoints',
        'Testing',
        'Related Documentation'
      ]
    },
    guide: {
      name: 'User/Developer Guide',
      location: 'guides/',
      fields: [
        { key: 'title', prompt: 'Guide title:', required: true },
        { key: 'audience', prompt: 'Target audience:', options: ['users', 'developers', 'admins'] },
        { key: 'difficulty', prompt: 'Difficulty level:', options: ['beginner', 'intermediate', 'advanced'] }
      ],
      sections: [
        'Overview',
        'Prerequisites',
        'Step-by-Step Instructions',
        'Examples',
        'Troubleshooting',
        'Related Documentation'
      ]
    },
    api: {
      name: 'API Documentation',
      location: 'api/',
      fields: [
        { key: 'title', prompt: 'API name:', required: true },
        { key: 'version', prompt: 'API version:', validation: /^v\d+(\.\d+)?$/ },
        { key: 'baseUrl', prompt: 'Base URL:', validation: /^https?:\/\// }
      ],
      sections: [
        'Overview',
        'Authentication',
        'Endpoints',
        'Request/Response Format',
        'Error Codes',
        'Examples',
        'SDKs and Libraries'
      ]
    },
    setup: {
      name: 'Setup Documentation',
      location: 'setup/',
      fields: [
        { key: 'title', prompt: 'Setup type:', required: true },
        { key: 'platform', prompt: 'Target platform:', options: ['local', 'staging', 'production', 'all'] },
        { key: 'prerequisites', prompt: 'Prerequisites summary:' }
      ],
      sections: [
        'Overview',
        'Prerequisites',
        'Installation Steps',
        'Configuration',
        'Verification',
        'Troubleshooting',
        'Next Steps'
      ]
    },
    reference: {
      name: 'Technical Reference',
      location: 'reference/',
      fields: [
        { key: 'title', prompt: 'Reference title:', required: true },
        { key: 'type', prompt: 'Reference type:', options: ['schema', 'config', 'api', 'architecture'] },
        { key: 'version', prompt: 'Version:', validation: /^\d+\.\d+\.\d+$/ }
      ],
      sections: [
        'Overview',
        'Specification',
        'Examples',
        'Related Documentation'
      ]
    }
  },

  // Automation Settings
  automation: {
    autoIndex: {
      enabled: true,
      updateOnChange: true,
      includeMetadata: true,
      groupByCategory: true
    },
    validation: {
      onCommit: true,
      onSave: false,
      showWarnings: true,
      strictMode: false
    },
    templateGeneration: {
      enabled: true,
      promptForMetadata: true,
      autoCreateDirectories: true,
      updateIndex: true
    },
    crossReference: {
      enabled: true,
      suggestRelated: true,
      updateBidirectional: true
    }
  },

  // AI Assistant Instructions
  aiInstructions: {
    enabled: true,
    rules: [
      'NEVER create documentation files in the root directory',
      'ALWAYS place new documentation in the appropriate docs/ subdirectory',
      'ALWAYS update the documentation index when adding files',
      'ALWAYS use the configured naming convention',
      'Run validation after making documentation changes'
    ],
    quickReference: {
      'User guides': 'docs/guides/',
      'Feature docs': 'docs/features/',
      'API docs': 'docs/api/',
      'Setup instructions': 'docs/setup/',
      'Technical specs': 'docs/reference/'
    },
    decisionTree: [
      { condition: 'User instructions or tutorials', location: 'guides/' },
      { condition: 'Feature specifications or requirements', location: 'features/' },
      { condition: 'API endpoints or technical specs', location: 'api/' },
      { condition: 'Installation or configuration', location: 'setup/' },
      { condition: 'Database schemas or references', location: 'reference/' }
    ]
  },

  // Project Type Presets
  presets: {
    'web-app': {
      categories: ['guides/', 'api/', 'features/', 'setup/', 'components/'],
      templates: ['feature', 'guide', 'api', 'setup'],
      focusAreas: ['API documentation', 'User guides', 'Component docs']
    },
    'game': {
      categories: ['guides/', 'features/', 'mechanics/', 'setup/', 'assets/'],
      templates: ['feature', 'guide', 'setup'],
      focusAreas: ['Game mechanics', 'Player guides', 'Feature specs']
    },
    'library': {
      categories: ['api/', 'guides/', 'examples/', 'reference/'],
      templates: ['api', 'guide', 'reference'],
      focusAreas: ['API reference', 'Usage examples', 'Integration guides']
    },
    'mobile-app': {
      categories: ['guides/', 'features/', 'api/', 'setup/', 'platforms/'],
      templates: ['feature', 'guide', 'api', 'setup'],
      focusAreas: ['Platform-specific docs', 'User guides', 'API integration']
    }
  },

  // Quality Metrics
  metrics: {
    track: [
      'documentation_coverage',
      'link_health',
      'template_usage',
      'validation_issues',
      'update_frequency'
    ],
    targets: {
      minDocsPerFeature: 1,
      maxBrokenLinks: 0,
      minIndexCoverage: 95
    }
  }
};

// Utility function to get configuration for current project type
function getProjectConfig() {
  const config = module.exports;
  const preset = config.presets[config.project.type];
  
  if (preset) {
    // Merge preset with base configuration
    return {
      ...config,
      categories: Object.fromEntries(
        preset.categories.map(cat => [cat, config.categories[cat] || { description: cat }])
      ),
      templates: Object.fromEntries(
        preset.templates.map(tpl => [tpl, config.templates[tpl]])
      )
    };
  }
  
  return config;
}

module.exports.getProjectConfig = getProjectConfig;