# 🚀 Database Management Framework Installation Guide

This guide helps you install and configure the Database Management Agent Framework for any project.

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ (for framework tools)
- **Database**: PostgreSQL, MySQL, SQLite, or SQL Server
- **Git** (for version control)

### Optional
- **Docker** (if using containerized databases)
- **Database GUI** (pgAdmin, MySQL Workbench, etc.)

## 🎯 Quick Installation

### 1. Copy Framework to Your Project
```bash
# Navigate to your project root
cd /path/to/your/project

# Copy the generic framework
cp -r docs/scaffolding/database-management-framework/ docs/frameworks/database/

# Or create a symbolic link for easier updates
ln -s docs/scaffolding/database-management-framework docs/frameworks/database
```

### 2. Create Required Directories
```bash
# Create migration directories
mkdir -p migrations/{applied,pending,rollback,archived}

# Create documentation directories  
mkdir -p docs/database/{schema,snapshots,reports}

# Create logs directory
mkdir -p logs/database
```

### 3. Configure for Your Database

#### PostgreSQL
```bash
# Copy and customize config
cp docs/frameworks/database/config/database-config.template.js \
   docs/frameworks/database/config/database-config.js

# Edit the config file
nano docs/frameworks/database/config/database-config.js
```

Example PostgreSQL configuration:
```javascript
module.exports = {
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'myproject_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  migrations: {
    directory: './migrations',
    tableName: 'migration_history'
  }
};
```

#### MySQL
```javascript
module.exports = {
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'myproject_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password'
  },
  migrations: {
    directory: './migrations',
    tableName: 'migration_history'
  }
};
```

#### SQLite
```javascript
module.exports = {
  connection: {
    database: process.env.DB_FILE || './database.db'
  },
  migrations: {
    directory: './migrations',
    tableName: 'migration_history'
  }
};
```

### 4. Set Environment Variables
Create a `.env` file in your project root:

```bash
# Database Type
DB_TYPE=postgresql  # postgresql, mysql, sqlite, sqlserver

# Connection Details
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myproject_db
DB_USER=myuser
DB_PASSWORD=mypassword

# Framework Settings
MIGRATIONS_DIR=./migrations
MIGRATION_TABLE=migration_history

# Optional: Docker settings
USE_DOCKER=false
DB_CONTAINER=my_db_container
```

### 5. Install Dependencies
```bash
# Install required Node.js packages
npm install pg mysql2 sqlite3 dotenv

# Make tools executable
chmod +x docs/frameworks/database/tools/*.js
```

### 6. Initialize Framework
```bash
# Set database type
export DB_TYPE=postgresql  # or mysql, sqlite, etc.

# Initialize migration tracking
node docs/frameworks/database/tools/migration-tracker-generic.js init

# Verify setup
node docs/frameworks/database/tools/migration-tracker-generic.js status
```

## 🔧 Database-Specific Setup

### PostgreSQL with Docker
```bash
# Start PostgreSQL container
docker run --name postgres_db \
  -e POSTGRES_DB=myproject_db \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -p 5432:5432 \
  -d postgres:15

# Set Docker environment
echo "USE_DOCKER=true" >> .env
echo "DB_CONTAINER=postgres_db" >> .env

# Test connection
docker exec postgres_db psql -U myuser -d myproject_db -c "SELECT version();"
```

### MySQL with Docker
```bash
# Start MySQL container
docker run --name mysql_db \
  -e MYSQL_DATABASE=myproject_db \
  -e MYSQL_USER=myuser \
  -e MYSQL_PASSWORD=mypassword \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -p 3306:3306 \
  -d mysql:8.0

# Set Docker environment
echo "USE_DOCKER=true" >> .env
echo "DB_CONTAINER=mysql_db" >> .env

# Test connection
docker exec mysql_db mysql -u myuser -pmypassword myproject_db -e "SELECT version();"
```

### SQLite (Local File)
```bash
# Create database file
touch ./database.db

# Set SQLite configuration
echo "DB_TYPE=sqlite" >> .env
echo "DB_FILE=./database.db" >> .env

# Test connection
sqlite3 ./database.db "SELECT sqlite_version();"
```

## 📚 Framework Customization

### 1. Update Tool References
Edit each tool file to use your project's configuration:

```bash
# Update migration-tracker-generic.js
sed -i 's/migration-tracker-generic/migration-tracker/g' \
  docs/frameworks/database/tools/migration-tracker-generic.js

# Rename for convenience
mv docs/frameworks/database/tools/migration-tracker-generic.js \
   docs/frameworks/database/tools/migration-tracker.js
```

### 2. Customize Agent Guides
Update the agent files to reference your project:

```bash
# Update project references in agent guides
find docs/frameworks/database/agents/ -name "*.md" -exec \
  sed -i 's/your_project/myproject/g' {} \;
```

### 3. Create Project-Specific Templates
```bash
# Copy and customize migration template
cp docs/frameworks/database/templates/migration-template-generic.sql \
   docs/frameworks/database/templates/migration-template.sql

# Update template variables
sed -i 's/{PROJECT_NAME}/MyProject/g' \
  docs/frameworks/database/templates/migration-template.sql
```

## ✅ Verification & Testing

### 1. Test Database Connection
```bash
# Check database connectivity
node -e "
const config = require('./docs/frameworks/database/config/database-config.js');
console.log('Database config loaded:', config.connection.database);
"
```

### 2. Test Migration Tracking
```bash
# Initialize tracking table
node docs/frameworks/database/tools/migration-tracker.js init

# Check status
node docs/frameworks/database/tools/migration-tracker.js status
```

### 3. Create Test Migration
```bash
# Copy template to create first migration
cp docs/frameworks/database/templates/migration-template.sql \
   migrations/001_initial_setup.sql

# Edit the migration file
nano migrations/001_initial_setup.sql

# Test migration validation
node docs/frameworks/database/tools/schema-validator.js check migrations/001_initial_setup.sql
```

### 4. Test Sandbox Environment
```bash
# Create sandbox database
node docs/frameworks/database/tools/migration-tester.js create-sandbox

# Test migration in sandbox
node docs/frameworks/database/tools/migration-tester.js test migrations/001_initial_setup.sql

# Clean up sandbox
node docs/frameworks/database/tools/migration-tester.js destroy-sandbox
```

## 📝 Next Steps

### 1. Read Agent Guides
- [Migration Validator](agents/migration-validator-generic.md)
- [Schema Documenter](agents/schema-documenter-generic.md)
- [Conflict Resolver](agents/conflict-resolver-generic.md)
- [Rollback Specialist](agents/rollback-specialist-generic.md)
- [Health Monitor](agents/health-monitor-generic.md)

### 2. Create Your First Migration
```bash
# Use the migration workflow
cp docs/frameworks/database/templates/migration-template.sql migrations/001_initial_schema.sql

# Follow the workflow guide
cat docs/frameworks/database/workflows/migration-workflow.md
```

### 3. Set Up Team Workflow
- Add framework commands to package.json
- Create team documentation
- Set up CI/CD integration
- Train team members on agent roles

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Fails
```bash
# Check environment variables
env | grep DB_

# Test direct connection
psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" -c "SELECT 1;"
```

#### Migration Tracking Table Creation Fails
```bash
# Check database permissions
# PostgreSQL
psql -c "SELECT current_user, session_user;"

# MySQL  
mysql -e "SELECT USER(), CURRENT_USER();"

# Verify CREATE TABLE permissions
```

#### Tools Not Executable
```bash
# Fix permissions
chmod +x docs/frameworks/database/tools/*.js

# Verify Node.js path
which node
head -1 docs/frameworks/database/tools/migration-tracker.js
```

### Database-Specific Issues

#### PostgreSQL
- Ensure `uuid-ossp` extension is available
- Check connection pooling settings
- Verify role permissions

#### MySQL
- Ensure proper character set (utf8mb4)
- Check storage engine compatibility
- Verify SQL mode settings

#### SQLite
- Ensure file permissions for database file
- Check foreign key pragma settings
- Verify concurrent access handling

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review database-specific documentation
3. Check framework logs in `logs/database/`
4. Consult database vendor documentation
5. Create issue in project repository

## 🎉 Success!

Once installed, you should have:
- ✅ Migration tracking system
- ✅ Validation tools
- ✅ Testing environment
- ✅ Documentation framework
- ✅ Agent workflow guides

You're ready to start managing database changes safely and systematically!