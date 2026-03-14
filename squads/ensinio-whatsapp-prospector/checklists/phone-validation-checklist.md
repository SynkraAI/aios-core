# Phone Validation Checklist

## E.164 Format Validation

### BLOCKING Checks (reject if fail)
- [ ] Starts with `+` (country code indicator)
- [ ] Only digits after `+` (no spaces, dashes, parentheses)
- [ ] Minimum 10 digits after `+` (shortest valid international number)
- [ ] Maximum 15 digits after `+` (E.164 limit)

### Brazil-Specific Checks (when starts with +55)
- [ ] DDD is valid (11-99, excluding reserved ranges)
- [ ] Mobile number has 9 prefix after DDD (13 digits total after +)
- [ ] OR landline without 9 prefix (12 digits total after +)
- [ ] DDD matches known Brazilian area codes

### WARNING Checks (approve with note)
- [ ] Number not flagged as landline (WhatsApp works primarily with mobile)
- [ ] Number not a known service number (0800, 0300, etc.)
- [ ] No duplicate numbers in the same group phone-book

## Common Brazilian DDDs by Region

### Sao Paulo
11, 12, 13, 14, 15, 16, 17, 18, 19

### Rio de Janeiro
21, 22, 24

### Espirito Santo
27, 28

### Minas Gerais
31, 32, 33, 34, 35, 37, 38

### Parana
41, 42, 43, 44, 45, 46

### Santa Catarina
47, 48, 49

### Rio Grande do Sul
51, 53, 54, 55

### Distrito Federal / Goias
61, 62, 64

### Mato Grosso
65, 66

### Mato Grosso do Sul
67

### Acre / Rondonia
68, 69

### Amazonas / Roraima
92, 95

### Para / Amapa
91, 93, 94, 96

### Tocantins / Maranhao
63, 98, 99

### Piaui / Ceara
86, 85, 88

### Rio Grande do Norte / Paraiba
84, 83

### Pernambuco / Alagoas
81, 82, 87

### Sergipe / Bahia
79, 71, 73, 74, 75, 77

## Auto-Normalization Rules

| Input Pattern | Regex | Normalization |
|---------------|-------|---------------|
| `+55XXXXXXXXXXX` | `^\+55\d{10,11}$` | Already valid, keep as-is |
| `55XXXXXXXXXXX` | `^55\d{10,11}$` | Prepend `+` |
| `0DDXXXXXXXX` | `^0\d{10,11}$` | Remove `0`, prepend `+55` |
| `DDXXXXXXXXX` | `^\d{10,11}$` | Prepend `+55` |
| `(DD) XXXXX-XXXX` | `^\(\d{2}\)\s?\d{4,5}-?\d{4}$` | Strip `()- `, prepend `+55` |
| `+[other country]` | `^\+(?!55)\d{10,15}$` | Keep as-is (international) |
