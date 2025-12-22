---
name: supabase-migrate
description: Generate safe SQL migrations for BuilderMaps Supabase database. Validates against existing schemas and provides rollback scripts. Use when adding tables, columns, indexes, or modifying the database structure.
allowed-tools: Read, Glob, Grep
---

# Supabase Migration Skill

Generate safe, validated SQL migrations for BuilderMaps PostgreSQL database.

## IMPORTANT: Safety Rules

This skill is **READ-ONLY** for analysis. It **GENERATES** migration SQL that you must manually review and apply. It does NOT execute any database commands.

**Never generate migrations that:**
- Drop tables without explicit confirmation
- Remove columns containing data
- Change column types destructively
- Modify RLS policies without careful review

## Instructions

### 1. Analyze Existing Schema

Read current schemas from:
- `database/supabase-schema.sql` - Core tables
- `database/supabase-admin-schema.sql` - Admin tables
- `database/optimizations.sql` - Indexes, views, functions

### 2. Current Database Tables

| Table | Purpose | Schema File |
|-------|---------|-------------|
| `users` | OAuth user profiles | supabase-schema.sql |
| `upvotes` | Spot upvotes | supabase-schema.sql |
| `reviews` | Spot reviews with ratings | supabase-schema.sql |
| `nominations` | Pending spot nominations | supabase-schema.sql |
| `city_requests` | New city requests | supabase-schema.sql |
| `admin_users` | Admin role assignments | supabase-admin-schema.sql |
| `spots` | Approved spots | supabase-admin-schema.sql |
| `admin_applications` | Admin applications | supabase-admin-schema.sql |
| `spot_reports` | User reports | supabase-admin-schema.sql |
| `deletion_requests` | Deletion requests | supabase-admin-schema.sql |
| `admin_audit_log` | Audit trail | supabase-admin-schema.sql |

### 3. Migration Templates

**Adding a column:**
```sql
-- Migration: Add [column] to [table]
-- Created: YYYY-MM-DD
-- Description: [purpose]

-- Forward Migration
ALTER TABLE [table_name]
  ADD COLUMN IF NOT EXISTS [column_name] [TYPE] [CONSTRAINTS];

-- Index (if needed for queries)
CREATE INDEX IF NOT EXISTS idx_[table]_[column]
  ON [table]([column]);

-- Rollback (run manually if needed)
-- ALTER TABLE [table_name] DROP COLUMN IF EXISTS [column_name];
```

**Adding a table:**
```sql
-- Migration: Create [table] table
-- Created: YYYY-MM-DD
-- Description: [purpose]

CREATE TABLE IF NOT EXISTS [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_[table]_[column]
  ON [table]([column]);

-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "policy_name" ON [table_name]
  FOR [SELECT|INSERT|UPDATE|DELETE]
  USING ([condition]);

-- Updated_at trigger
CREATE TRIGGER update_[table]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Rollback
-- DROP TABLE IF EXISTS [table_name];
```

**Adding a foreign key:**
```sql
ALTER TABLE [child_table]
  ADD CONSTRAINT fk_[child]_[parent]
  FOREIGN KEY ([column]) REFERENCES [parent_table](id)
  ON DELETE [CASCADE|SET NULL|RESTRICT];
```

**Adding an index:**
```sql
CREATE INDEX IF NOT EXISTS idx_[table]_[column]
  ON [table]([column]);

-- For composite index
CREATE INDEX IF NOT EXISTS idx_[table]_[col1]_[col2]
  ON [table]([col1], [col2]);

-- For partial index
CREATE INDEX IF NOT EXISTS idx_[table]_[column]_active
  ON [table]([column]) WHERE status = 'active';
```

### 4. Validation Checks

Before generating migration:
- Verify table/column doesn't already exist
- Check foreign key references are valid
- Ensure RLS policies are comprehensive
- Follow naming conventions (snake_case)
- Include rollback script

### 5. Safe Rename Pattern

```sql
-- Step 1: Add new column
ALTER TABLE t ADD COLUMN new_name TYPE;

-- Step 2: Copy data
UPDATE t SET new_name = old_name;

-- Step 3: Add constraints to new column
ALTER TABLE t ALTER COLUMN new_name SET NOT NULL;

-- Step 4: Drop old column (after verification)
-- ALTER TABLE t DROP COLUMN old_name;
```

## Output Format

```
## Migration: [Name]

### Analysis
- **Affected tables:** [list]
- **Breaking changes:** [yes/no with details]
- **Requires data migration:** [yes/no]

### Pre-flight Checklist
- [ ] Backup database before running
- [ ] Test on staging first
- [ ] Review RLS policy changes
- [ ] Notify team of schema change

### Migration SQL

```sql
[Generated SQL]
```

### Rollback SQL

```sql
[Rollback SQL]
```

### Post-migration
1. Verify with: `SELECT * FROM [table] LIMIT 5;`
2. Update TypeScript types if needed
3. Test affected API routes
```

## Key Files to Reference

- `database/supabase-schema.sql` - Core schema
- `database/supabase-admin-schema.sql` - Admin schema
- `database/optimizations.sql` - Existing indexes
- `database/seed-spots-diversity.sql` - Data patterns

## Example Usage

```
/supabase-migrate show schema
/supabase-migrate add column spots: average_rating DECIMAL(3,2)
/supabase-migrate create table spot_photos
/supabase-migrate add index reviews(spot_id, created_at)
/supabase-migrate add foreign key spot_photos.spot_id -> spots.id
```
