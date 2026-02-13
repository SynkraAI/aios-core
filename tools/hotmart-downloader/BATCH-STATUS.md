# Hotmart Batch Download — Status de Retomada

**Parado em:** 2026-02-11 ~14:12
**Destino:** `/Users/luizfosc/Dropbox/Downloads/Cursos`
**Script:** `tools/hotmart-downloader/batch_runner.py`

## Como retomar

```bash
cd ~/aios-core/tools/hotmart-downloader
rm .hotmart-token-cache.json   # token provavelmente expirou
source .venv/bin/activate
python batch_runner.py
```

O script tem skip automático (arquivos já baixados não são re-baixados).

## Status por curso

### Completos (batches anteriores)

| Curso | Arquivos | Notas |
|-------|----------|-------|
| Stories 10x | 74 | 9 mod, 32 aulas |
| Pronto para vender | 20 | 2 mod, 9 aulas |
| Seu produto pronto | 8 | 1 mod, 3 aulas |
| Tráfego Pronto | 27 | 2 mod, 14 aulas |
| Fórmula de Lançamento | 1.130 | 64 mod, 441 aulas |

### Completos (batch 3 atual)

| Curso | Arquivos | Notas |
|-------|----------|-------|
| WhatsApp 10x | 18 | 1 mod, 9 aulas |
| Crescimento 10x | 21 | 5 mod, 11 aulas |
| Mentalidade Black | 31 | 10 mod, 18 aulas |
| Filosofia Ladeira | 57 | 1 mod, 14 aulas |
| Conversão 10x | 22 | 3 mod, 11 aulas |

### Parcial (parado no meio)

| Curso | Arquivos | Notas |
|-------|----------|-------|
| **Light Copy** | 65 | 16 mod, 135 aulas. Parou no M2A23 (Gatilhos - História). ~23% do curso |

### Pendentes (nunca iniciados)

| Curso | Subdomain | Product ID |
|-------|-----------|------------|
| Venda Todo Santo Dia | blackfridayinfinita | 4594939 |
| SuperAds | blackfridayinfinita | 4594936 |
| A Batalha do Sucesso | mamaefalei | 474169 |
| Super Leitura Rápida | superleiturarapida | 1411374 |
| Areté - Destravando a Excelência | superleituras | 1092366 |

### Não incluídos no batch (já tinham pasta)

| Curso | Notas |
|-------|-------|
| Pitch de 100 Milhões | Sem product_id no script |
| Os 3 Funis High Ticket | Sem product_id no script |

## COURSES list atual no batch_runner.py

Ao retomar, a lista começa em WhatsApp 10x. Cursos já baixados serão skipados automaticamente. Light Copy vai retomar de onde parou (skip existing files).

## Warnings conhecidos

- Mentalidade Black: 4 vídeos sem m3u8 (timeout de resolução, não é bloqueante)
- WhatsApp 10x: Aulas 5-7 deram 401 no batch anterior, passaram no batch 3
- Token expira a cada ~48h. Sempre deletar `.hotmart-token-cache.json` antes de retomar
- Browser abre visível para login (pode pedir CAPTCHA na primeira vez)
