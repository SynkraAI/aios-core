# Task: Resolve Phone Numbers

## Task Anatomy
- **task_name:** resolve-phone-numbers
- **status:** active
- **responsible_executor:** prospector-chief (Atlas)
- **execution_type:** Interactive (requires user input)
- **input:**
  - Parsed contacts from validate-parsed-data
  - Existing phone-book for this group (if available)
  - Group slug identifier
- **output:**
  - Updated contacts with resolved phone numbers
  - Updated phone-book file for this group

## Context

WhatsApp exports show contact NAMES (not phone numbers) for contacts saved in the user's phone. Only unsaved contacts show their phone number. This task bridges that gap by asking the user to provide phone numbers for contacts that don't have one.

**IMPORTANT:** Phone books are PER GROUP. A "Joao" in Group A is NOT the same "Joao" in Group B. Each group has its own phone-book file.

## Phone Number Format (E.164 - WhatsApp Standard)

```
+[country_code][area_code][number]
```

### Brazil Rules
| Type | Format | Example | Total Digits |
|------|--------|---------|-------------|
| Mobile (all DDDs) | +55[DDD]9[XXXX][XXXX] | +5511999887766 | 13 |
| Landline | +55[DDD][XXXX][XXXX] | +551133445566 | 12 |

### Validation Rules
- MUST start with `+`
- Country code follows immediately (no spaces, no dashes)
- Brazil mobile: 13 digits after `+` (55 + 2-digit DDD + 9 + 8 digits)
- Brazil landline: 12 digits after `+` (55 + 2-digit DDD + 8 digits)
- International: varies by country, minimum 10 digits after `+`
- NO spaces, dashes, or parentheses in stored format
- Display format can use separators, but storage is always clean E.164

### Common User Input → Normalized
| User Types | Normalized |
|------------|-----------|
| `31 99988-7766` | `+5531999887766` |
| `(31) 99988-7766` | `+5531999887766` |
| `+55 31 99988-7766` | `+5531999887766` |
| `5531999887766` | `+5531999887766` |
| `031999887766` | `+5531999887766` |

## Action Items

### Step 0: Resolve Emoji-Only Names from Chat Context (AUTOMÁTICO)

**ANTES de qualquer resolução de telefone**, o parser já identifica contatos cujo "nome" no WhatsApp é apenas emojis/símbolos (sem letras). Para esses contatos:

1. **Detecção automática**: O parser marca `is_emoji_only: true` e salva o emoji original em `original_name`
2. **Resolução por regex**: O parser tenta encontrar auto-identificação nas mensagens da pessoa (ex: "meu nome é João", "sou a Maria", "aqui é o Carlos")
3. **Resolução inteligente (agente)**: Para contatos que o parser NÃO conseguiu resolver automaticamente, o agente DEVE:

   a. **Ler TODAS as mensagens** do contato emoji-only, buscando:
      - Auto-apresentações ("meu nome é...", "me chamo...", "sou o/a...")
      - Assinaturas em mensagens (ex: "Att, João" ou "— Maria" no final)
      - Contexto implícito (ex: alguém responde "obrigado João" para essa pessoa)
      - Menções cruzadas (outro membro diz "como o João/🤩 falou")

   b. **Ler mensagens de OUTROS participantes** que mencionem o emoji:
      - "@🤩" seguido de nome real
      - Respostas que comecem com nome + contexto que ligue ao emoji
      - Menções como "o 🤩 que é o João disse..."

   c. **Regra de confiança**:
      | Evidência | Confiança | Ação |
      |-----------|-----------|------|
      | Auto-identificação explícita ("meu nome é X") | Alta | Usar nome automaticamente |
      | Múltiplas menções cruzadas (2+) | Média | Usar nome, marcar para revisão |
      | Apenas 1 menção ou contexto ambíguo | Baixa | **Perguntar ao usuário** |
      | Nenhuma evidência | — | Deixar em branco, perguntar ao usuário |

   d. **Output**: Atualizar o contato com:
      - `name`: nome real resolvido (ou manter emoji se não encontrou)
      - `original_name`: emoji original (preservado sempre)
      - `name_source`: `"chat_context"` ou `"user_input"`
      - `name_confidence`: `"high"` / `"medium"` / `"low"`

   e. **Apresentar ao usuário** um resumo:
      ```
      📋 Name Resolution: {group_name}
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      Emoji-only contacts found: {N}
      Auto-resolved (high confidence): {X}
      Need confirmation (medium): {Y}
      No name found: {Z}

      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      🤩 → "João Silva" (found: "meu nome é João Silva" — msg de 15/02)
      ⚖️ → "Carlos Souza" (found: member replied "valeu Carlos" — msg de 20/02)
      🔥 → ??? (no name evidence found)

      Confirma os nomes resolvidos? (y/n/editar)
      ```

**IMPORTANTE:** A mensagem de outreach precisa ser o mais pessoal possível. Um nome real faz TODA a diferença entre uma mensagem genérica e uma que gera resposta. Invista tempo nessa etapa.

### Step 1: Load Phone Book
1. Derive group slug from group name (lowercase, spaces → hyphens, remove special chars)
2. Check if `data/phone-books/{group-slug}.json` exists
3. If exists: load previously resolved numbers
4. If not: create empty phone-book

### Step 2: Classify Contacts
Separate contacts into 3 categories:

| Category | Criteria | Action |
|----------|----------|--------|
| **Already resolved** | Phone present in parsed data OR in phone-book | Skip (use existing number) |
| **Needs resolution** | No phone, has meaningful messages (count >= 3) | Ask user |
| **Low priority** | No phone, few messages (count < 3) | Ask user (optional, can skip) |

### Step 2b: Image-Based Resolution (SEMPRE PRIMEIRO)

**ORDEM OBRIGATORIA:** Imagens primeiro → manual depois (apenas residuais).

O usuario fornece screenshots dos membros do grupo (geralmente capturados via CleanShot no WhatsApp). Esta e a forma PRIMARIA de resolver telefones.

**Fluxo:**

1. Pedir o caminho da pasta com as imagens:
   ```
   Informe o caminho da pasta com as imagens dos membros do grupo:
   > _
   ```

2. **Split de imagem grande**: Geralmente o usuario fornece um unico screenshot longo (scrolling capture do CleanShot). Antes de processar, verificar:
   - Se a pasta contem apenas 1 imagem com altura > 2000px
   - Se sim, cortar automaticamente em pedacos de 1080px de altura:
   ```bash
   magick "{imagem}" -crop x1080 +repage "{pasta}/pedaco_%02d.png"
   ```
   - Informar ao usuario: "Imagem cortada em {N} pedacos para leitura"

3. **Ler cada pedaco**: Usar a tool `Read` para ler cada imagem (Claude e multimodal)
   - Extrair nomes e numeros de telefone visiveis
   - Formato esperado: lista de membros do grupo WhatsApp com nome + telefone

4. **Normalizar e associar**: Para cada numero encontrado nas imagens:
   - Normalizar para E.164
   - Associar ao contato pelo nome (match por nome exato ou similaridade)
   - Contatos sem match: apresentar ao usuario para associacao manual

5. **Contabilizar residuais**: Apos processar TODAS as imagens, listar contatos que ainda nao tem telefone. Estes seguem para o Step 3 (ultima tentativa manual).

**Importante:**
- As imagens NAO sao salvas no repositorio (apenas processadas)
- Os numeros extraidos sao salvos no phone-book normalmente
- Source no phone-book: `"image_extraction"` (em vez de `"user_input"`)

### Step 3: Last Resort — Manual Resolution (APENAS RESIDUAIS)

**So chega aqui** quem NAO foi resolvido via imagens no Step 2b. Para cada contato restante, apresentar como ultima tentativa uma **unique quote fingerprint** — a distinctive phrase the person said in the group that, when searched in WhatsApp, will locate EXACTLY that person's message.

**Quote selection criteria:**
- Must be unique within the group (no other person said the same thing)
- Prefer phrases with proper nouns, specific numbers, or niche-specific terms
- Avoid generic phrases like "bom dia", "obrigado", "alguém sabe..."
- Prefer longer phrases (8+ words) for search accuracy
- If no unique phrase exists, combine 2 short distinctive phrases

```
📋 Phone Resolution: {group_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Already resolved: {N} contacts
Need phone number: {M} contacts
Low priority (< 3 msgs): {L} contacts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contact 1/{M}: {contact_name}
Messages: {count} | Period: {first_date} to {last_date}
🔍 Search quote: "{unique_quote_fingerprint}"

Phone number (or 'skip' to exclude):
> _
```

**IMPORTANT:** The search quote MUST be copy-pasteable directly into WhatsApp's search bar to find the exact message.

### Step 4: Validate Input
For each phone number provided:
1. Strip all non-digit characters (except leading `+`)
2. If starts with `0`: remove `0`, prepend `+55`
3. If starts with `55` (no `+`): prepend `+`
4. If starts with `+55`: validate length (12 or 13 digits after `+`)
5. If starts with `+` but NOT `+55`: accept as international
6. If doesn't match any pattern: ask again with format hint
7. Confirm: "Phone for {name}: {normalized_number} — correct? (y/n)"

### Step 5: Save Phone Book
Write/update `data/phone-books/{group-slug}.json` with:
```json
{
  "group_name": "Nome do Grupo Original",
  "group_slug": "nome-do-grupo-original",
  "last_updated": "2026-03-09T10:00:00Z",
  "contacts": {
    "Joao": {
      "phone": "+5531999887766",
      "resolved_at": "2026-03-09T10:00:00Z",
      "source": "user_input"
    },
    "Maria": {
      "phone": "+5521988776655",
      "resolved_at": "2026-03-09T10:01:00Z",
      "source": "parsed_from_chat"
    },
    "Pedro": {
      "phone": "+5511977665544",
      "resolved_at": "2026-03-09T10:02:00Z",
      "source": "image_extraction"
    },
    "🤩": {
      "phone": "+5511999887766",
      "resolved_name": "João Silva",
      "name_source": "chat_context",
      "name_confidence": "high",
      "resolved_at": "2026-03-09T10:03:00Z",
      "source": "image_extraction",
      "notes": "Found: 'meu nome é João Silva' in message from 15/02"
    }
  },
  "skipped": ["Carlos", "Ana"]
}
```

### Step 6: Merge and Output
1. Merge resolved phones back into parsed contacts
2. Contacts with `skip` are excluded from further pipeline phases
3. Output updated contacts list with phone coverage report

## Acceptance Criteria
- All contacts classified correctly (resolved/needs/low-priority)
- Phone numbers validated against E.164 format
- Common Brazilian formats auto-normalized
- Phone-book saved per group (not global)
- Skipped contacts excluded from pipeline
- Previously resolved contacts reused from phone-book
- User input normalized and confirmed before saving

## Veto Conditions

| Condition | Severity | Resolution |
|-----------|----------|------------|
| validate-parsed-data not completed | BLOCKING | Run validation first |
| 0 contacts need resolution | INFO | All contacts already have phones, skip this phase |
| All contacts skipped | WARNING | No prospects with phone — pipeline will produce empty results |
| Invalid phone format after 2 attempts | WARNING | Skip contact, flag in report |

## Output Example
```json
{
  "resolution_summary": {
    "total_contacts": 150,
    "already_had_phone": 60,
    "resolved_by_user": 20,
    "resolved_from_images": 25,
    "resolved_from_phonebook": 12,
    "skipped": 33,
    "phone_coverage_before": "40%",
    "phone_coverage_after": "78%",
    "images_processed": 5,
    "image_split_from": 1
  },
  "updated_contacts": [
    {
      "name": "Joao",
      "phone": "+5531999887766",
      "phone_source": "user_input",
      "message_count": 45,
      "messages": [...]
    }
  ],
  "phone_book_path": "data/phone-books/grupo-marketing-digital.json"
}
```

## Error Handling
- **Phone-book directory missing:** Create `data/phone-books/` automatically
- **Phone-book file corrupted:** Start fresh, warn user that previous data was lost
- **User provides same number for 2 contacts:** Warn but allow (could be shared phone)
- **Non-Brazilian number:** Accept if valid E.164, flag as international in phone-book

## Completion Criteria
All contacts either have a phone number or are explicitly skipped. Phone-book saved for future runs. Updated contacts ready for analyze-prospects phase.
