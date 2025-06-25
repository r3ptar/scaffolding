#!/usr/bin/env node

/**
 * Migration Tracker - Generic Version
 * Track applied migrations and their status for any project
 * 
 * Usage:
 *   node migration-tracker.js status          # Show current migration status
 *   node migration-tracker.js pending         # List pending migrations
 *   node migration-tracker.js history         # Show migration history
 *   node migration-tracker.js init            # Initialize tracking table
 *   node migration-tracker.js mark-applied <migration> # Manually mark as applied
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Load project-specific configuration
const config = require('../config/database-config.js');

// Configuration - Customize these for your project
const MIGRATIONS_DIR = config.migrations?.directory || path.join(__dirname, '../../../migrations');
const TRACKING_TABLE = config.migrations?.tableName || 'migration_history';
const DB_CONNECTION = config.connection;

class MigrationTracker {
    constructor() {
        this.dbType = process.env.DB_TYPE || 'postgresql'; // postgresql, mysql, sqlite
    }

    async init() {
        console.log('🚀 Initializing migration tracking system...');
        
        const createTableSQL = this.getCreateTableSQL();

        try {
            await this.executeSQL(createTableSQL);
            console.log('✅ Migration tracking table created successfully');
        } catch (error) {
            console.error('❌ Failed to create tracking table:', error.message);
            process.exit(1);
        }
    }

    getCreateTableSQL() {
        switch (this.dbType) {
            case 'postgresql':
                return `
                    CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
                        id SERIAL PRIMARY KEY,
                        migration_number INTEGER NOT NULL,
                        migration_name TEXT NOT NULL UNIQUE,
                        applied_at TIMESTAMPTZ DEFAULT NOW(),
                        applied_by TEXT DEFAULT CURRENT_USER,
                        execution_time_ms INTEGER,
                        checksum TEXT,
                        status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'failed', 'rolled_back')),
                        error_message TEXT,
                        rollback_at TIMESTAMPTZ,
                        notes TEXT
                    );

                    CREATE INDEX IF NOT EXISTS idx_migration_number ON ${TRACKING_TABLE}(migration_number);
                    CREATE INDEX IF NOT EXISTS idx_status ON ${TRACKING_TABLE}(status);
                    CREATE INDEX IF NOT EXISTS idx_applied_at ON ${TRACKING_TABLE}(applied_at DESC);
                `;
            case 'mysql':
                return `
                    CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        migration_number INT NOT NULL,
                        migration_name VARCHAR(255) NOT NULL UNIQUE,
                        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        applied_by VARCHAR(255) DEFAULT USER(),
                        execution_time_ms INT,
                        checksum VARCHAR(255),
                        status ENUM('applied', 'failed', 'rolled_back') DEFAULT 'applied',
                        error_message TEXT,
                        rollback_at TIMESTAMP NULL,
                        notes TEXT,
                        
                        INDEX idx_migration_number (migration_number),
                        INDEX idx_status (status),
                        INDEX idx_applied_at (applied_at DESC)
                    );
                `;
            case 'sqlite':
                return `
                    CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        migration_number INTEGER NOT NULL,
                        migration_name TEXT NOT NULL UNIQUE,
                        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        applied_by TEXT DEFAULT 'system',
                        execution_time_ms INTEGER,
                        checksum TEXT,
                        status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'failed', 'rolled_back')),
                        error_message TEXT,
                        rollback_at DATETIME,
                        notes TEXT
                    );

                    CREATE INDEX IF NOT EXISTS idx_migration_number ON ${TRACKING_TABLE}(migration_number);
                    CREATE INDEX IF NOT EXISTS idx_status ON ${TRACKING_TABLE}(status);
                    CREATE INDEX IF NOT EXISTS idx_applied_at ON ${TRACKING_TABLE}(applied_at DESC);
                `;
            default:
                throw new Error(`Unsupported database type: ${this.dbType}`);
        }
    }

    async executeSQL(sql) {
        switch (this.dbType) {
            case 'postgresql':
                return this.executePostgreSQL(sql);
            case 'mysql':
                return this.executeMySQL(sql);
            case 'sqlite':
                return this.executeSQLite(sql);
            default:
                throw new Error(`Unsupported database type: ${this.dbType}`);
        }
    }

    async executePostgreSQL(sql) {
        const { host, port, database, user, password } = DB_CONNECTION;
        const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
        
        // If using Docker (customize for your setup)
        if (process.env.USE_DOCKER === 'true') {
            const containerName = process.env.DB_CONTAINER || 'postgres_container';
            return execSync(`docker exec -i ${containerName} psql -U ${user} -d ${database}`, { input: sql });
        } else {
            return execSync(`psql "${connectionString}"`, { input: sql });
        }
    }

    async executeMySQL(sql) {
        const { host, port, database, user, password } = DB_CONNECTION;
        
        if (process.env.USE_DOCKER === 'true') {
            const containerName = process.env.DB_CONTAINER || 'mysql_container';
            return execSync(`docker exec -i ${containerName} mysql -u ${user} -p${password} ${database}`, { input: sql });
        } else {
            return execSync(`mysql -h ${host} -P ${port} -u ${user} -p${password} ${database}`, { input: sql });
        }
    }

    async executeSQLite(sql) {
        const dbPath = DB_CONNECTION.database || './database.db';
        return execSync(`sqlite3 ${dbPath}`, { input: sql });
    }

    async getAllMigrations() {
        try {
            const files = await fs.readdir(MIGRATIONS_DIR);
            const migrations = files
                .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
                .map(f => {
                    const match = f.match(/^(\d{3})_(.+)\.sql$/);
                    if (match) {
                        return {
                            number: parseInt(match[1]),
                            name: f,
                            description: match[2].replace(/_/g, ' ')
                        };
                    }
                    return null;
                })
                .filter(Boolean)
                .sort((a, b) => a.number - b.number);
            
            return migrations;
        } catch (error) {
            console.error('❌ Failed to read migrations directory:', error.message);
            return [];
        }
    }

    async getAppliedMigrations() {
        const query = `
            SELECT migration_number, migration_name, applied_at, execution_time_ms, status
            FROM ${TRACKING_TABLE}
            WHERE status = 'applied'
            ORDER BY migration_number;
        `;

        try {
            const result = await this.executeQuery(query);
            return this.parseQueryResult(result);
        } catch (error) {
            console.error('❌ Failed to get applied migrations:', error.message);
            return [];
        }
    }

    async executeQuery(query) {
        switch (this.dbType) {
            case 'postgresql':
                const { host, port, database, user, password } = DB_CONNECTION;
                if (process.env.USE_DOCKER === 'true') {
                    const containerName = process.env.DB_CONTAINER || 'postgres_container';
                    return execSync(`docker exec -i ${containerName} psql -U ${user} -d ${database} -t -A -F'|' -c "${query}"`).toString();
                } else {
                    const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
                    return execSync(`psql "${connectionString}" -t -A -F'|' -c "${query}"`).toString();
                }
            case 'mysql':
                // MySQL implementation
                const mysqlCmd = process.env.USE_DOCKER === 'true' 
                    ? `docker exec -i ${process.env.DB_CONTAINER || 'mysql_container'} mysql -u ${DB_CONNECTION.user} -p${DB_CONNECTION.password} ${DB_CONNECTION.database} -N -B`
                    : `mysql -h ${DB_CONNECTION.host} -u ${DB_CONNECTION.user} -p${DB_CONNECTION.password} ${DB_CONNECTION.database} -N -B`;
                return execSync(`${mysqlCmd} -e "${query}"`).toString();
            case 'sqlite':
                return execSync(`sqlite3 ${DB_CONNECTION.database} "${query}"`).toString();
            default:
                throw new Error(`Unsupported database type: ${this.dbType}`);
        }
    }

    parseQueryResult(result) {
        if (!result.trim()) return [];

        return result.trim().split('\n').map(line => {
            const parts = line.split('|');
            return {
                number: parseInt(parts[0]),
                name: parts[1],
                applied_at: parts[2],
                execution_time_ms: parseInt(parts[3]) || null,
                status: parts[4]
            };
        });
    }

    async showStatus() {
        console.log('📊 Migration Status Report\n');

        const allMigrations = await this.getAllMigrations();
        const appliedMigrations = await this.getAppliedMigrations();
        const appliedNumbers = new Set(appliedMigrations.map(m => m.number));

        console.log(`Total Migrations: ${allMigrations.length}`);
        console.log(`Applied: ${appliedMigrations.length}`);
        console.log(`Pending: ${allMigrations.length - appliedMigrations.length}\n`);

        console.log('📋 Migration List:');
        console.log('─'.repeat(80));
        console.log('Status │ Num │ Migration Name                          │ Applied Date │ Time');
        console.log('─'.repeat(80));

        for (const migration of allMigrations) {
            const applied = appliedNumbers.has(migration.number);
            const appliedInfo = applied 
                ? appliedMigrations.find(m => m.number === migration.number)
                : null;

            const status = applied ? '✅' : '⏳';
            const date = appliedInfo ? new Date(appliedInfo.applied_at).toLocaleDateString() : 'Pending';
            const time = appliedInfo && appliedInfo.execution_time_ms 
                ? `${appliedInfo.execution_time_ms}ms` 
                : '-';

            console.log(
                `  ${status}   │ ${String(migration.number).padStart(3, '0')} │ ${migration.name.padEnd(40)} │ ${date.padEnd(12)} │ ${time}`
            );
        }
    }

    async showPending() {
        console.log('⏳ Pending Migrations\n');

        const allMigrations = await this.getAllMigrations();
        const appliedMigrations = await this.getAppliedMigrations();
        const appliedNumbers = new Set(appliedMigrations.map(m => m.number));

        const pending = allMigrations.filter(m => !appliedNumbers.has(m.number));

        if (pending.length === 0) {
            console.log('✅ All migrations have been applied!');
            return;
        }

        console.log(`Found ${pending.length} pending migrations:\n`);

        for (const migration of pending) {
            console.log(`  ${String(migration.number).padStart(3, '0')} - ${migration.name}`);
        }

        console.log('\nTo apply pending migrations:');
        console.log('  1. Review each migration file');
        console.log('  2. Test in development environment');
        console.log('  3. Apply using your migration tool');
        console.log('  4. Mark as applied: node migration-tracker.js mark-applied <migration_name>');
    }

    async showHistory() {
        console.log('📜 Migration History\n');

        const query = `
            SELECT 
                migration_number,
                migration_name,
                applied_at,
                execution_time_ms,
                status,
                applied_by
            FROM ${TRACKING_TABLE}
            ORDER BY applied_at DESC
            LIMIT 20;
        `;

        try {
            const result = await this.executeQuery(query);

            if (!result.trim()) {
                console.log('No migration history found.');
                return;
            }

            console.log('Recent Migration Activity:');
            console.log('─'.repeat(100));
            console.log('Number │ Name                                     │ Applied At          │ Time    │ Status   │ By');
            console.log('─'.repeat(100));

            const rows = this.parseQueryResult(result);
            rows.forEach(row => {
                const date = new Date(row.applied_at).toLocaleString();
                const timeStr = row.execution_time_ms ? `${row.execution_time_ms}ms` : '-';
                
                console.log(
                    `${String(row.number).padStart(6)} │ ${row.name.padEnd(40)} │ ${date.padEnd(19)} │ ${timeStr.padEnd(7)} │ ${row.status.padEnd(8)} │ ${row.applied_by || 'unknown'}`
                );
            });
        } catch (error) {
            console.error('❌ Failed to get migration history:', error.message);
        }
    }

    async markApplied(migrationName) {
        console.log(`📌 Marking ${migrationName} as applied...`);

        const match = migrationName.match(/^(\d{3})_/);
        if (!match) {
            console.error('❌ Invalid migration name format');
            return;
        }

        const number = parseInt(match[1]);

        const query = `
            INSERT INTO ${TRACKING_TABLE} (migration_number, migration_name, notes)
            VALUES (${number}, '${migrationName}', 'Manually marked as applied');
        `;

        try {
            await this.executeSQL(query);
            console.log('✅ Migration marked as applied');
        } catch (error) {
            console.error('❌ Failed to mark migration as applied:', error.message);
        }
    }
}

// CLI Interface
async function main() {
    const command = process.argv[2];
    const tracker = new MigrationTracker();

    switch (command) {
        case 'init':
            await tracker.init();
            break;
        case 'status':
            await tracker.showStatus();
            break;
        case 'pending':
            await tracker.showPending();
            break;
        case 'history':
            await tracker.showHistory();
            break;
        case 'mark-applied':
            const migration = process.argv[3];
            if (!migration) {
                console.error('❌ Please provide migration name');
                process.exit(1);
            }
            await tracker.markApplied(migration);
            break;
        default:
            console.log('Migration Tracker - Generic Database Management Framework\n');
            console.log('Usage:');
            console.log('  node migration-tracker.js status          # Show current migration status');
            console.log('  node migration-tracker.js pending         # List pending migrations');
            console.log('  node migration-tracker.js history         # Show migration history');
            console.log('  node migration-tracker.js init            # Initialize tracking table');
            console.log('  node migration-tracker.js mark-applied <migration> # Manually mark as applied');
            console.log('\nConfiguration:');
            console.log('  Set DB_TYPE environment variable: postgresql | mysql | sqlite');
            console.log('  Update config/database-config.js for connection details');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = MigrationTracker;