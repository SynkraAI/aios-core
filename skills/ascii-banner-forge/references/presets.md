# Presets de Tamanho — ASCII Banner Forge

## Tabela de Presets

| Preset | Colunas x Linhas | Aspect Ratio | Uso principal |
|--------|-------------------|--------------|---------------|
| `fullscreen` | 197x99 | ~2:1 | Banner de sessao SessionStart (tela cheia, terminal do Luiz) |
| `compact` | 80x24 | ~3.3:1 | Terminal padrao 80 colunas — compatibilidade maxima |
| `wide` | 120x40 | 3:1 | Splash screen entre etapas de um workflow |
| `mini` | 40x20 | 2:1 | Icone, avatar, preview pequeno |
| `square` | 60x60 | 1:1 | Proporção Instagram square |
| `cinema` | 120x50 | ~2.4:1 | Proporção YouTube thumbnail (16:9 ajustado para char ratio) |
| `story` | 40x71 | ~0.56:1 | Proporção Stories/Reels (9:16 ajustado para char ratio) |
| `banner-horizontal` | 120x30 | 4:1 | Banner largo para header/footer de CLI |
| `thumbnail` | 60x34 | ~1.76:1 | Miniatura para preview em listas |

## Nota sobre Aspect Ratio em Terminal

Caracteres de terminal NAO sao quadrados. Um caractere tipico tem aspect ratio de ~1:2 (metade da largura da altura). Isso significa que:

- **1:1 visual** (quadrado na tela) = ~2:1 em colunas:linhas
- **16:9 visual** = ~3.5:1 em colunas:linhas
- **9:16 visual** = ~1:1.8 em colunas:linhas

Os presets ja levam isso em conta. O `square` (60x60) aparece como retangulo no arquivo mas como quadrado no terminal.

## Como chafa calcula as dimensões

O `chafa` aceita `--size=WxH` onde:
- W = numero de colunas (caracteres)
- H = numero de linhas

Se apenas W for fornecido (`--size=120`), chafa calcula H automaticamente mantendo o aspect ratio da imagem original.

## Exemplos de uso

```bash
# Gerar com preset
generate.sh asset foto.jpg --preset cinema

# Gerar com tamanho custom
generate.sh asset foto.jpg --size 150x75

# Preview rapido com preset
generate.sh live foto.jpg --preset mini
```

## Qual preset escolher?

| Cenario | Preset recomendado |
|---------|--------------------|
| Banner de inicializacao do Claude Code | `fullscreen` |
| Arte entre sessoes de um framework | `wide` |
| Logo para mostrar no CLI | `mini` |
| Preview de produto/resultado | `thumbnail` |
| Arte decorativa/impressionante | `fullscreen` |
| Compatibilidade com qualquer terminal | `compact` |
