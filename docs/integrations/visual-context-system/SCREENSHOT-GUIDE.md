# Guia para Screenshots 📸

Como tirar screenshots profissionais para a documentação.

## 🎯 Screenshots Necessários

### 1. Hero Banner (Priority 1)
**Arquivo:** `docs/images/hero-banner.png`
**O que mostrar:** Visão geral do statusline em ação
**Dimensões:** 1200x400px (banner wide)

**Como tirar:**
1. Abrir iTerm2 em tela cheia
2. Executar:
   ```bash
   npx aios-core context set-title "Design Futurista" --emoji 🎨
   npx aios-core context set "aios-core" --progress "6/10"
   ```
3. Esperar alguns minutos para custo/tempo acumularem
4. Capturar área do statusline + um pouco de contexto
5. Crop e resize para 1200x400px

### 2. Statusline Preview (Priority 1)
**Arquivo:** `docs/images/statusline-preview.png`
**O que mostrar:** Statusline completo com 2 linhas destacadas
**Dimensões:** 1000x120px (wide, narrow)

**Como tirar:**
1. iTerm2 com tema claro ou dark (escolha)
2. Destacar/circular as 2 linhas do statusline
3. Capturar só o statusline (sem muito contexto)
4. Crop tight ao redor do statusline

### 3. Tab Title Preview (Priority 2)
**Arquivo:** `docs/images/tab-title-preview.png`
**O que mostrar:** Título da aba com emoji
**Dimensões:** 600x80px (close-up)

**Como tirar:**
1. iTerm2 com título visível
2. Zoom/capture da aba mostrando "🎨 Design Futurista"
3. Crop ao redor da tab
4. Adicionar seta ou highlight para enfatizar emoji

### 4. Emoji Themes (Priority 2)
**Arquivo:** `docs/images/emoji-themes.png`
**O que mostrar:** Múltiplas tabs com diferentes emojis
**Dimensões:** 800x200px (horizontal strip)

**Como tirar:**
1. Abrir 4 tabs no iTerm2
2. Em cada tab, definir título diferente:
   ```bash
   # Tab 1
   npx aios-core context set-title "Design System" --emoji 🎨

   # Tab 2
   npx aios-core context set-title "Backend API" --emoji ⚙️

   # Tab 3
   npx aios-core context set-title "Mind Clone" --emoji 🧠

   # Tab 4
   npx aios-core context set-title "Marketing" --emoji 📢
   ```
3. Capturar tab bar mostrando as 4 tabs
4. Crop horizontal strip

### 5. Installation Demo (Priority 3)
**Arquivo:** `docs/images/installation-demo.gif`
**O que mostrar:** Processo de instalação em GIF animado
**Formato:** GIF animado, max 5MB

**Como tirar:**
1. Usar [Kap](https://getkap.co/) ou similar
2. Gravar:
   - Copiar statusline.sh
   - Editar settings.json
   - Reiniciar Claude Code
   - Ver statusline aparecer
3. Exportar como GIF (720p, 10fps)

## 🛠️ Ferramentas Recomendadas

### Screenshot

**macOS nativo:**
```bash
# Captura de área (Cmd+Shift+4)
# Salva em ~/Desktop

# Captura de janela (Cmd+Shift+4 + Space)
# Salva em ~/Desktop
```

**CleanShot X (Recomendado):**
- Anotações profissionais
- Blur sensível
- Upload direto
- https://cleanshot.com/

### Edição

**Preview (nativo macOS):**
- Crop, resize, anotações básicas

**Figma/Canva:**
- Layouts profissionais
- Adicionar títulos/setas
- Exportar em alta qualidade

### GIF Recording

**Kap (Grátis):**
```bash
brew install --cask kap
```

**Gifski (Converter vídeo → GIF):**
```bash
brew install gifski
```

## 📏 Especificações Técnicas

### Dimensões

| Screenshot | Width | Height | Ratio |
|-----------|-------|--------|-------|
| Hero Banner | 1200px | 400px | 3:1 |
| Statusline Preview | 1000px | 120px | ~8:1 |
| Tab Title | 600px | 80px | 7.5:1 |
| Emoji Themes | 800px | 200px | 4:1 |
| Installation GIF | 720px | auto | 16:9 |

### Formato e Qualidade

- **Formato:** PNG (screenshots), GIF (animações)
- **Compressão:** PNG-8 ou PNG-24, otimizado
- **DPI:** 144 (Retina) ou 72 (Standard)
- **Tamanho máximo:** 500KB por PNG, 5MB por GIF
- **Background:** Transparente onde aplicável

## 🎨 Estilo Visual

### Tema iTerm2

Recomendado: **Usar tema DARK** para melhor contraste

```
iTerm2 > Settings > Appearance > Theme > Dark
```

Temas populares:
- **Dracula** (roxo/rosa)
- **One Dark** (azul escuro)
- **Monokai** (verde/amarelo)

### Anotações

Se adicionar setas/highlights:
- **Cor:** Vermelho (#FF0000) ou Laranja (#FF6B00)
- **Espessura:** 3-4px
- **Sombra:** Leve drop shadow para destaque

### Texto

Se adicionar títulos:
- **Font:** SF Pro Display (macOS) ou Inter
- **Tamanho:** 16-20px para títulos
- **Cor:** Branco sobre dark, Dark sobre light

## 🚀 Processo Completo

### 1. Preparar Ambiente

```bash
# 1. Abrir iTerm2
open -a iTerm

# 2. Definir contexto bonito
cd ~/aios-core
npx aios-core context set-title "Design Futurista" --emoji 🎨
npx aios-core context set "aios-core" --progress "6/10"

# 3. Esperar métricas acumularem (5-10 min)
# Usar Claude Code enquanto isso

# 4. Verificar statusline está bonito
# Model, progress bar, cost, time, context todos visíveis
```

### 2. Tirar Screenshots

```bash
# macOS: Cmd+Shift+4 (arrastar área)
# Salvar em ~/Desktop

# Ou usar CleanShot X
```

### 3. Editar e Otimizar

```bash
# Renomear arquivos
mv ~/Desktop/Screenshot*.png ~/aios-visual-context-system/docs/images/hero-banner.png

# Otimizar tamanho (opcional)
brew install pngquant
pngquant --quality=65-80 docs/images/*.png
```

### 4. Adicionar ao Git

```bash
cd ~/aios-visual-context-system
git add docs/images/
git commit -m "docs: add professional screenshots"
git push
```

### 5. Atualizar README

Remover placeholders no README.md:
```markdown
# Antes
![Visual Context System](docs/images/hero-banner.png)

# Depois (se imagem existe)
![Visual Context System](docs/images/hero-banner.png)
```

## ✅ Checklist Final

- [ ] Hero banner (1200x400px)
- [ ] Statusline preview (1000x120px)
- [ ] Tab title preview (600x80px)
- [ ] Emoji themes (800x200px)
- [ ] Installation GIF (opcional)
- [ ] Imagens otimizadas (<500KB cada)
- [ ] Commitadas no git
- [ ] README atualizado

## 💡 Dicas Profissionais

1. **Use iTerm2** - Melhor renderização de emoji
2. **Tema escuro** - Melhor contraste visual
3. **Limpe a tela** - Só contexto relevante
4. **Métricas reais** - Deixe acumular custo/tempo
5. **Crop tight** - Foco no essencial
6. **Otimize tamanho** - <500KB por imagem
7. **Consistência** - Mesmo tema em todos screenshots

---

**Pronto para tirar screenshots profissionais!** 📸✨

Se precisar de ajuda, abra uma issue!
