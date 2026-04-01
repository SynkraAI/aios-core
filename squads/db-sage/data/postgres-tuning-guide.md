# PostgreSQL Tuning Guide

## Memory
```
shared_buffers = 25% of RAM
effective_cache_size = 75% of RAM
work_mem = RAM / max_connections / 16
maintenance_work_mem = RAM / 16
```

## Connections
```
max_connections = (RAM - shared_buffers) / 10MB
Use PgBouncer for connection pooling
```

## Query Performance
```
statement_timeout = 30s
lock_timeout = 10s
idle_in_transaction_session_timeout = 60s
```

## Monitoring
```
auto_explain.log_min_duration = 1000
log_statement = 'ddl'
log_min_duration_statement = 1000
```

## Vacuum
```
autovacuum = on
autovacuum_max_workers = 4
```

**References:**
- https://pgtune.leopard.in.ua/
- https://www.postgresql.org/docs/current/runtime-config.html
