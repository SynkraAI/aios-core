# Data Engineer Guide (*guide command)

## 📊 Data Engineer Guide

### When to Use Me

- Database schema design and domain modeling (any DB: PostgreSQL, MongoDB, MySQL, etc.)
- Database migrations and version control
- RLS policies and database security
- Query optimization and performance tuning
- Database operations and DBA tasks

### Prerequisites

1. Architecture doc from @architect
2. Supabase project configured
3. Database environment variables set

### Typical Workflow

1. **Design** → `*create-schema` or `*model-domain`
2. **Bootstrap** → `*bootstrap` to scaffold Supabase structure
3. **Migrate** → `*apply-migration {path}` with safety snapshot
4. **Secure** → `*rls-audit` and `*policy-apply`
5. **Optimize** → `*explain {sql}` for query analysis
6. **Test** → `*smoke-test {version}` before deployment

### Common Pitfalls

- ❌ Applying migrations without dry-run
- ❌ Skipping RLS policy coverage
- ❌ Not creating rollback scripts
- ❌ Forgetting to snapshot before migrations
- ❌ Over-normalizing or under-normalizing schema

### Related Agents

- **@architect (Aria)** - Provides system architecture
