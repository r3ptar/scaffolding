/**
 * Database Configuration Template
 * Copy this file to database-config.js and customize for your project
 */

module.exports = {
  // Database connection settings
  connection: {
    // PostgreSQL
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'your_database_name',
    user: process.env.DB_USER || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
    
    // For SSL connections (optional)
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false
  },
  
  // Migration settings
  migrations: {
    // Directory containing migration files
    directory: process.env.MIGRATIONS_DIR || './migrations',
    
    // Table name for tracking applied migrations
    tableName: process.env.MIGRATION_TABLE || 'migration_history',
    
    // File naming pattern (used for validation)
    pattern: /^(\d{3})_(.+)\.sql$/,
    
    // Maximum migration number (prevents conflicts)
    maxNumber: 999
  },
  
  // Sandbox testing configuration
  sandbox: {
    // Test database name (will be created/destroyed during testing)
    database: (process.env.DB_NAME || 'your_database_name') + '_test_sandbox',
    
    // Tables to copy essential data from for testing
    essentialTables: [
      'users',
      'api_keys',
      // Add other tables that migrations might depend on
    ],
    
    // Maximum time to wait for sandbox operations (ms)
    timeout: 30000
  },
  
  // Schema documentation settings
  documentation: {
    // Output directory for generated docs
    outputDir: './docs/database',
    
    // Include these schemas in documentation
    schemas: ['public'],
    
    // Exclude these tables from documentation
    excludeTables: [
      'migration_history',
      'schema_migrations' // Common migration tracking tables
    ],
    
    // Include table comments in documentation
    includeComments: true,
    
    // Generate ERD diagrams
    generateDiagrams: true
  },
  
  // Health monitoring settings
  monitoring: {
    // Performance thresholds
    thresholds: {
      // Query time warnings (ms)
      slowQuery: 100,
      
      // Query time critical (ms)
      criticalQuery: 1000,
      
      // Index hit rate minimum (%)
      indexHitRate: 95,
      
      // Connection pool utilization warning (%)
      connectionPoolWarning: 70,
      
      // Disk space warning (%)
      diskSpaceWarning: 85
    },
    
    // Health check frequency (minutes)
    checkInterval: 60,
    
    // Retention period for health data (days)
    retentionDays: 30
  },
  
  // Backup settings (optional)
  backup: {
    // Backup before applying migrations
    beforeMigration: true,
    
    // Backup directory
    directory: './backups',
    
    // Retention period for backups (days)
    retentionDays: 7,
    
    // Compression
    compress: true
  },
  
  // Environment-specific overrides
  environments: {
    development: {
      connection: {
        database: process.env.DB_NAME + '_dev'
      },
      monitoring: {
        checkInterval: 5 // More frequent checks in dev
      }
    },
    
    test: {
      connection: {
        database: process.env.DB_NAME + '_test'
      },
      migrations: {
        // Use different migration table for tests
        tableName: 'test_migration_history'
      }
    },
    
    production: {
      connection: {
        ssl: {
          rejectUnauthorized: true
        }
      },
      backup: {
        beforeMigration: true, // Always backup in production
        retentionDays: 30      // Keep backups longer
      },
      monitoring: {
        checkInterval: 15      // More frequent monitoring
      }
    }
  }
};

// Helper function to get environment-specific config
function getConfig() {
  const baseConfig = module.exports;
  const env = process.env.NODE_ENV || 'development';
  const envConfig = baseConfig.environments[env] || {};
  
  // Deep merge environment config with base config
  return mergeDeep(baseConfig, envConfig);
}

// Deep merge utility
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Export the config getter
module.exports.getConfig = getConfig;