# 🗄️ Database Management Agent Framework (Generic)

**Version**: 1.0.0  
**Type**: Project-Agnostic Framework  
**Purpose**: Systematic database migration management for any project

## Overview

This framework provides organized database migration management for any project using PostgreSQL (easily adaptable to other databases). It addresses common problems like migration conflicts, lack of rollback scripts, poor documentation, and unsafe deployment practices.

## 🎯 Framework Goals

1. **Migration Control**: Track, validate, and safely apply database changes
2. **Schema Documentation**: Maintain accurate, auto-generated documentation
3. **Conflict Prevention**: Identify and resolve migration conflicts before they cause issues
4. **Rollback Safety**: Ensure every change can be safely reversed
5. **Health Monitoring**: Track database performance and integrity

## 🤖 Agent Roles

### Agent 1: Migration Validator
- **Responsibility**: Pre-flight checks on all migrations
- **Key Tasks**:
  - SQL syntax validation
  - Dependency checking
  - Conflict detection
  - Sandbox testing
- **Guide**: [agents/migration-validator.md](agents/migration-validator.md)

### Agent 2: Schema Documenter
- **Responsibility**: Maintain accurate schema documentation
- **Key Tasks**:
  - Auto-generate schema docs
  - Create ERD diagrams
  - Track schema evolution
  - Maintain data dictionary
- **Guide**: [agents/schema-documenter.md](agents/schema-documenter.md)

### Agent 3: Conflict Resolver
- **Responsibility**: Clean up migration chaos
- **Key Tasks**:
  - Identify duplicate migrations
  - Consolidate fix attempts
  - Standardize numbering
  - Directory organization
- **Guide**: [agents/conflict-resolver.md](agents/conflict-resolver.md)

### Agent 4: Rollback Specialist
- **Responsibility**: Ensure safe reversibility
- **Key Tasks**:
  - Create rollback scripts
  - Test rollback procedures
  - Emergency response
  - Recovery planning
- **Guide**: [agents/rollback-specialist.md](agents/rollback-specialist.md)

### Agent 5: Database Health Monitor
- **Responsibility**: Ongoing database health
- **Key Tasks**:
  - Track migration status
  - Monitor performance
  - Detect schema drift
  - Data integrity checks
- **Guide**: [agents/health-monitor.md](agents/health-monitor.md)

## 🛠️ Available Tools

### Core Tools
- **[migration-tracker.js](tools/migration-tracker.js)**: Track applied migrations
- **[schema-validator.js](tools/schema-validator.js)**: Validate against live DB
- **[migration-tester.js](tools/migration-tester.js)**: Safe sandbox testing
- **[schema-generator.js](tools/schema-generator.js)**: Auto-generate docs
- **[conflict-detector.js](tools/conflict-detector.js)**: Find conflicts

### Quick Commands
```bash
# Check migration status
node tools/migration-tracker.js status

# Validate new migration
node tools/schema-validator.js check migrations/001_new_feature.sql

# Generate schema documentation
node tools/schema-generator.js

# Find migration conflicts
node tools/conflict-detector.js

# Test migration in sandbox
node tools/migration-tester.js test migrations/001_new_feature.sql
```

## 📋 Installation & Setup

### 1. Copy Framework to Your Project
```bash
# Copy the entire framework
cp -r docs/scaffolding/database-management-framework/ docs/frameworks/database/

# Or create symbolic link for easier updates
ln -s docs/scaffolding/database-management-framework docs/frameworks/database
```

### 2. Customize for Your Project
Edit the following files to match your project:

**`tools/migration-tracker.js`**:
```javascript
// Update database connection details
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'your_database';
const DB_USER = process.env.DB_USER || 'your_user';

// Update migrations directory
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');
```

**`config/database-config.js`** (create this file):
```javascript
module.exports = {
  // Database connection
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'your_database',
    user: process.env.DB_USER || 'your_user',
    password: process.env.DB_PASSWORD || 'your_password'
  },
  
  // Migrations settings
  migrations: {
    directory: './migrations',
    tableName: 'migration_history'
  },
  
  // Sandbox testing
  sandbox: {
    database: process.env.DB_NAME + '_test_sandbox'
  }
};
```

### 3. Set Up Your Directory Structure
```bash
# Create required directories
mkdir -p migrations/{applied,pending,rollback,archived}
mkdir -p docs/database/{schema,snapshots,reports}

# Initialize migration tracking
node tools/setup-framework.js
```

## 📁 Recommended Directory Structure

```
your-project/
├── migrations/                 # All database migrations
│   ├── applied/               # Successfully applied
│   ├── pending/               # Not yet applied
│   ├── rollback/              # Rollback scripts
│   └── archived/              # Old/duplicate migrations
├── docs/
│   ├── database/              # Schema documentation
│   │   ├── schema/           # Current schema docs
│   │   ├── snapshots/        # Point-in-time snapshots
│   │   └── reports/          # Health reports
│   └── frameworks/
│       └── database/         # This framework
└── tools/                     # Database utilities (optional)
```

## 🔧 Database-Specific Adaptations

### PostgreSQL (Default)
Works out of the box with minimal configuration.

### MySQL/MariaDB
Update connection settings in tools:
```javascript
// Replace PostgreSQL-specific commands
// FROM: psql -U user -d database
// TO:   mysql -u user -D database

// Update SQL syntax differences
// PostgreSQL: gen_random_uuid()
// MySQL:      UUID()
```

### SQLite
```javascript
// Update connection for SQLite
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.db');
```

### SQL Server
```javascript
// Update for SQL Server
const sql = require('mssql');
const config = {
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true
    }
};
```

## 📋 Migration Naming Convention

**Standard Format**: `NNN_description.sql`

Where:
- `NNN` = Three-digit sequential number (001, 002, 003...)
- `description` = Snake_case description

**Examples**:
```
001_initial_schema.sql
002_add_user_authentication.sql
003_create_product_tables.sql
050_add_search_indexes.sql
```

## 🔄 Workflow Integration

### Standard Migration Process
1. **Create** migration using template
2. **Validate** with Agent 1 (Migration Validator)
3. **Test** in sandbox environment
4. **Document** changes with Agent 2 (Schema Documenter)
5. **Apply** to production
6. **Monitor** with Agent 5 (Health Monitor)

### Emergency Rollback
1. **Assess** the situation
2. **Execute** rollback script
3. **Verify** system restoration
4. **Document** incident
5. **Update** procedures

## 🌟 Success Metrics

After implementing this framework, you should see:

- **Migration Success Rate**: 100% (no failed productions deployments)
- **Rollback Coverage**: 100% (every migration has rollback)
- **Documentation Currency**: <7 days old
- **Conflict Rate**: 0% (no conflicting migrations)
- **Test Coverage**: 100% (every migration tested)

## 🔗 Integration with Other Frameworks

This framework works well with:

- **Sprint Management**: Track database tasks in sprint planning
- **Bug Tracking**: Log database issues systematically
- **Architecture Reviews**: Include schema changes in architecture decisions
- **CI/CD Pipelines**: Automate migration testing and deployment

## 📚 Additional Resources

- [Migration Workflow Guide](workflows/migration-workflow.md)
- [Agent Responsibilities](agents/)
- [Tool Documentation](tools/)
- [Templates](templates/)

## 🆘 Common Migration Problems This Solves

1. ❌ **Multiple migration files with same numbers**
   ✅ **Unique sequential numbering with conflict detection**

2. ❌ **No rollback scripts**
   ✅ **Every migration has tested rollback**

3. ❌ **Outdated schema documentation**
   ✅ **Auto-generated, always current documentation**

4. ❌ **Migrations break production**
   ✅ **Sandbox testing before production deployment**

5. ❌ **No migration tracking**
   ✅ **Complete history with execution times and status**

6. ❌ **Chaotic migration directories**
   ✅ **Organized structure with clear purposes**

## 🎯 Quick Start Checklist

- [ ] Copy framework to your project
- [ ] Update database connection settings
- [ ] Create directory structure
- [ ] Run setup-framework.js
- [ ] Read agent guides
- [ ] Create your first migration using templates
- [ ] Test the workflow with a simple migration
- [ ] Train your team on the process

Remember: This framework scales from single-developer projects to large teams. Start simple and expand as needed!