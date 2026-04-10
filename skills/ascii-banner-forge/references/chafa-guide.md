# Guia do chafa — ASCII Banner Forge

## O que e o chafa

`chafa` e uma ferramenta CLI que converte imagens (JPG, PNG, GIF, HEIC, WebP, SVG, etc.) em arte ASCII/ANSI colorida para o terminal. Suporta true-color RGB (16 milhoes de cores).

## Instalacao

```bash
brew install chafa
```

## Comando base da skill

```bash
chafa --format=symbols --size=WxH --color-space=din99d <imagem>
```

### Flags essenciais

| Flag | Valor | Funcao |
|------|-------|--------|
| `--format` | `symbols` | Usa caracteres Unicode para melhor resolucao visual |
| `--size` | `WxH` | Dimensoes em colunas x linhas (ex: `197x99`) |
| `--color-space` | `din99d` | Espaco de cor perceptual — cores mais fieis ao original |

### Outros valores de --format

| Valor | Resultado |
|-------|-----------|
| `symbols` | **Recomendado.** Caracteres Unicode com cores ANSI. Melhor qualidade. |
| `sixels` | Grafico de alta resolucao (requer terminal compativel: mlterm, foot, xterm +sixel) |
| `kitty` | Protocolo do Kitty terminal (alta resolucao) |
| `iterm2` | Protocolo iTerm2 (alta resolucao, macOS) |

Para maxima compatibilidade entre terminais, usar `symbols`.

### Outros valores de --color-space

| Valor | Uso |
|-------|-----|
| `din99d` | **Recomendado.** Perceptualmente uniforme, cores mais naturais. |
| `rgb` | Espaco RGB linear. Rapido mas cores podem parecer "lavadas". |

## Formatos de entrada suportados

| Formato | Extensoes |
|---------|-----------|
| JPEG | .jpg, .jpeg |
| PNG | .png |
| GIF | .gif (inclusive animado) |
| WebP | .webp |
| HEIC/HEIF | .heic, .heif (fotos iPhone) |
| SVG | .svg |
| BMP | .bmp |
| TIFF | .tif, .tiff |
| ICO | .ico |

## Dicas de qualidade

### Imagem fonte ideal
- Resolucao alta (1080p+) produz melhores resultados
- Imagens com alto contraste ficam mais nítidas
- Fotos com muitos detalhes pequenos perdem informacao — preferir composicoes simples
- Fundos escuros funcionam melhor em terminais com fundo escuro

### Tamanho de saída
- Terminal do Luiz: 249 colunas visiveis, sweet spot = **197x99**
- Fullscreen usa ~197 colunas para nao quebrar linhas
- Quanto maior o tamanho, mais detalhes mas maior o arquivo .asc

### Peso dos arquivos
- Um .asc fullscreen (197x99) tipicamente tem 200-700KB
- Isso acontece porque cada caractere carrega codigos de cor ANSI (\033[38;2;R;G;Bm)
- Para assets menores, usar presets como `compact` (80x24) ou `mini` (40x20)

## Exemplos praticos

```bash
# Foto da familia → fullscreen
chafa --format=symbols --size=197x99 --color-space=din99d ~/fotos/familia.heic > banner.asc

# Logo da empresa → miniatura
chafa --format=symbols --size=40x20 --color-space=din99d logo.png > logo.asc

# Preview rapido (sem salvar)
chafa --format=symbols --size=80x24 --color-space=din99d foto.jpg

# GIF animado (mostra animacao no terminal)
chafa --format=symbols --size=120x40 animacao.gif
```

## Troubleshooting

| Problema | Causa | Solucao |
|----------|-------|---------|
| Saida com 1 linha so | Falta `--format=symbols` | Adicionar flag |
| Cores "lavadas" | Color space RGB | Usar `--color-space=din99d` |
| Arte quebra no terminal | Tamanho maior que terminal | Reduzir `--size` ou usar preset `compact` |
| "command not found" | chafa nao instalado | `brew install chafa` |
| HEIC nao funciona | libheif nao instalado | `brew install libheif` e reinstalar chafa |
