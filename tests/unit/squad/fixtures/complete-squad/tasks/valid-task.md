---
task: Test Task
responsavel: @test-agent
responsavel_type: agent
atomic_layer: task
Entrada: |
  - input_param: string (required)
  - optional_param: boolean (default: false)
Saida: |
  - result: Object with { success, data }
Checklist:
  - [ ] Validate input parameters
  - [ ] Execute main logic
  - [ ] Return result
---

# *test-task

A valid test task that follows TASK-FORMAT-SPECIFICATION-V1.

## Usage

```
@test-agent
*test-task input_value
```

## Flow

1. Receive input
2. Process data
3. Return result
