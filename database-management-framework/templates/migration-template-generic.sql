-- Migration: {NUMBER}_{DESCRIPTION}
-- Project: {PROJECT_NAME}
-- Author: {AUTHOR}
-- Created: {DATE}
-- Description: {DETAILED_DESCRIPTION}
-- 
-- Dependencies: {LIST_ANY_REQUIRED_MIGRATIONS_OR_TABLES}
-- Estimated Duration: {TIME_ESTIMATE}
-- Risk Level: LOW | MEDIUM | HIGH
-- Rollback: {NUMBER}_{DESCRIPTION}_rollback.sql
-- Database: {DATABASE_TYPE} (postgresql/mysql/sqlite)

-- Pre-migration checks
-- Note: Adjust syntax based on your database type
DO $check$
BEGIN 
    -- PostgreSQL syntax (adapt for other databases)
    -- Check that required dependencies exist
    -- IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'required_table') THEN
    --     RAISE EXCEPTION 'Required table does not exist';
    -- END IF;
    
    -- Verify we're not accidentally re-running this migration
    -- IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'new_table_name') THEN
    --     RAISE EXCEPTION 'Migration already applied - new_table_name exists';
    -- END IF;
    
    RAISE NOTICE 'Pre-migration checks passed';
END $check$;

-- Begin transaction for atomicity
BEGIN;

-- Log migration start (adapt table name and syntax for your project)
INSERT INTO migration_history (migration_number, migration_name, applied_at, applied_by, status)
VALUES ({NUMBER}, '{NUMBER}_{DESCRIPTION}', NOW(), USER, 'in_progress')
ON CONFLICT (migration_name) DO NOTHING;

-- ================================================================
-- MIGRATION CHANGES START HERE
-- ================================================================

-- Example: Create new table
CREATE TABLE IF NOT EXISTS example_table (
    -- PostgreSQL syntax
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- MySQL syntax: id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    -- SQLite syntax: id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- PostgreSQL timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- MySQL timestamps
    -- created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- SQLite timestamps
    -- created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_name_length CHECK (length(name) > 0)
    -- MySQL: CONSTRAINT check_name_length CHECK (CHAR_LENGTH(name) > 0)
);

-- Create unique constraint (cross-database compatible)
CREATE UNIQUE INDEX IF NOT EXISTS idx_example_table_name_unique ON example_table(name);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_example_table_name ON example_table(name);
CREATE INDEX IF NOT EXISTS idx_example_table_created_at ON example_table(created_at);
-- Note: SQLite doesn't support IF NOT EXISTS for indexes in older versions

-- Example: Alter existing table
-- ALTER TABLE existing_table 
--     ADD COLUMN IF NOT EXISTS new_column VARCHAR(255),  -- PostgreSQL
--     ADD COLUMN IF NOT EXISTS another_column INTEGER DEFAULT 0;

-- MySQL syntax:
-- ALTER TABLE existing_table 
--     ADD COLUMN new_column VARCHAR(255),
--     ADD COLUMN another_column INTEGER DEFAULT 0;

-- SQLite syntax (requires multiple statements):
-- ALTER TABLE existing_table ADD COLUMN new_column TEXT;
-- ALTER TABLE existing_table ADD COLUMN another_column INTEGER DEFAULT 0;

-- Example: Insert seed data (if needed)
INSERT INTO example_table (name, description) VALUES
    ('Sample 1', 'First sample record'),
    ('Sample 2', 'Second sample record')
ON CONFLICT (name) DO NOTHING;  -- PostgreSQL
-- MySQL: ON DUPLICATE KEY UPDATE description = VALUES(description);
-- SQLite: ON CONFLICT (name) DO NOTHING;

-- Example: Update existing data
-- UPDATE existing_table 
-- SET new_column = 'default_value'
-- WHERE new_column IS NULL;

-- Example: Create function (PostgreSQL only)
-- CREATE OR REPLACE FUNCTION update_timestamp()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Example: Create trigger (PostgreSQL)
-- DROP TRIGGER IF EXISTS trigger_update_timestamp ON example_table;
-- CREATE TRIGGER trigger_update_timestamp
--     BEFORE UPDATE ON example_table
--     FOR EACH ROW
--     EXECUTE FUNCTION update_timestamp();

-- MySQL trigger example:
-- DROP TRIGGER IF EXISTS trigger_update_timestamp;
-- CREATE TRIGGER trigger_update_timestamp
--     BEFORE UPDATE ON example_table
--     FOR EACH ROW
--     SET NEW.updated_at = NOW();

-- ================================================================
-- MIGRATION CHANGES END HERE
-- ================================================================

-- Post-migration validation
DO $validate$
BEGIN 
    -- Verify migration completed successfully
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'example_table') THEN
        RAISE EXCEPTION 'Migration failed - example_table was not created';
    END IF;
    
    -- Verify data integrity
    -- IF (SELECT COUNT(*) FROM example_table) < 2 THEN
    --     RAISE EXCEPTION 'Migration failed - seed data not inserted';
    -- END IF;
    
    RAISE NOTICE 'Post-migration validation passed';
END $validate$;

-- Update migration status to completed
UPDATE migration_history 
SET status = 'applied', 
    execution_time_ms = EXTRACT(EPOCH FROM (NOW() - applied_at)) * 1000
WHERE migration_name = '{NUMBER}_{DESCRIPTION}';

-- Commit transaction
COMMIT;

-- Post-migration notes
-- TODO: Remember to:
-- 1. Create corresponding rollback script: {NUMBER}_{DESCRIPTION}_rollback.sql
-- 2. Update schema documentation
-- 3. Test in sandbox environment: node tools/migration-tester.js test this_file.sql
-- 4. Inform team of schema changes
-- 5. Monitor performance after deployment
-- 6. Update any dependent application code

-- Database-specific notes:
-- PostgreSQL: Uses UUID, rich data types, stored procedures
-- MySQL: Uses CHAR(36) for UUIDs, different timestamp handling
-- SQLite: Limited ALTER TABLE support, no stored procedures
-- SQL Server: Uses UNIQUEIDENTIFIER, different function syntax