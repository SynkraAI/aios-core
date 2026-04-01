# RLS Security Patterns

## User-Owned Data
```sql
(SELECT auth.uid()) = user_id
```

## Team Access
```sql
team_id IN (SELECT team_id FROM team_members WHERE user_id = (SELECT auth.uid()))
```

## Role-Based
```sql
(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
```

## Public Read, Auth Write
```sql
-- SELECT: TO anon, authenticated USING (true)
-- INSERT: TO authenticated WITH CHECK (auth.uid() = user_id)
```

## Time-Based
```sql
published_at IS NOT NULL AND published_at <= now()
```

## Hierarchical
```sql
EXISTS (SELECT 1 FROM parent WHERE id = table.parent_id AND user_id = auth.uid())
```

## Security Definer (Fast)
```sql
CREATE FUNCTION user_has_access(uuid) RETURNS boolean SECURITY DEFINER
```

**Common Pitfalls:**
- ❌ Not wrapping auth.uid() → slow
- ❌ Using user_metadata → insecure
- ❌ Missing indexes → full scan
- ❌ No NULL check → fails for anon

**References:**
- https://supabase.com/docs/guides/database/postgres/row-level-security
