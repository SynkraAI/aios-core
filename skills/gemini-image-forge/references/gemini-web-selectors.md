# Gemini Web — Seletores Playwright

**IMPORTANTE:** A UI do Gemini Web muda com frequência. Este arquivo documenta os seletores usados pelo `batch-generate.cjs`. Quando o script quebrar por "selector not found", atualize AQUI e não dentro do script.

URL base: `https://gemini.google.com/app`

---

## 1. Detectar login

O script considera "logado" se encontrar o input de prompt visível na página.

```javascript
const LOGGED_IN_SELECTORS = [
  'rich-textarea textarea',
  'rich-textarea [contenteditable="true"]',
  'textarea[aria-label*="Prompt" i]',
  '[aria-label*="Enter a prompt" i]',
  '[role="textbox"]',
];
```

Tenta cada um com timeout 3s. Primeiro que aparecer visível = logado.

---

## 2. Input de prompt

Onde colar o texto do prompt.

```javascript
const INPUT_SELECTORS = [
  'rich-textarea [contenteditable="true"]',
  'rich-textarea textarea',
  '[role="textbox"][contenteditable="true"]',
  'textarea[aria-label*="Prompt" i]',
];
```

**Observação:** Gemini usa um componente `rich-textarea` customizado. Geralmente o filho visível é um `div[contenteditable="true"]`. Se o script falhar em "clear":
- Clicar no input
- `Control+A` + `Delete`
- Depois digitar

---

## 3. Enviar prompt

Opção primária: `Enter` após digitar.

Opção fallback: clicar no botão de envio.

```javascript
const SEND_BUTTON_SELECTORS = [
  'button[aria-label*="Send" i]',
  'button[aria-label*="Enviar" i]',
  'button:has([data-mat-icon-name="send"])',
];
```

---

## 4. Imagem gerada

O Gemini renderiza a imagem gerada como `<img>` dentro de uma resposta.

```javascript
const IMAGE_SELECTORS = [
  'img[src*="googleusercontent"][alt*="generated" i]',
  'img[data-test-id*="image"]',
  'image-component img',
  'img[src^="data:image"]',
  'img[src*="blob:"]',
];
```

**Dica:** O `src` pode ser:
- `data:image/png;base64,...` → extrair base64 direto
- `blob:https://...` → usar `page.evaluate(fetch)` dentro do contexto do browser
- `https://lh3.googleusercontent.com/...` → idem fetch

Tempo de geração típico: 10–45 segundos. Script espera até 90s.

---

## 5. Safety filter detection

Quando o Gemini bloqueia por safety, ele mostra uma mensagem de texto.

```javascript
const SAFETY_REGEX = /can.*t help|policy|safety|not able to|unable to generate/i;
```

Usando Playwright:
```javascript
const isSafety = await page.locator(`text=${SAFETY_REGEX}`).first().isVisible();
```

Se detectar, marcar item como `failed` com reason `safety_filter`.

---

## 6. New chat (limpar contexto entre gerações)

Essencial para não misturar prompts.

```javascript
const NEW_CHAT_SELECTORS = [
  '[aria-label*="New chat" i]',
  '[aria-label*="Nova conversa" i]',
  'button:has-text("New chat")',
  'button:has-text("Nova conversa")',
];
```

Se não encontrar, o script continua (não-fatal), mas é fortemente recomendado clicar.

---

## 7. Debug: como descobrir seletores novos

Quando a UI mudar:

```bash
# Rode com --debug para browser visível
node scripts/batch-generate.cjs \
  --prompts ./prompts.json \
  --output ./out \
  --mode preflight \
  --debug
```

Abra DevTools (F12 ou Cmd+Opt+I), inspecione o elemento, copie:
1. `aria-label` se houver (mais estável)
2. `role` (estável)
3. Tag customizada (`rich-textarea`, `image-component`)
4. CSS classes são INSTÁVEIS — evite

Atualize este arquivo ANTES de mexer no script.

---

## Histórico de mudanças

| Data | Mudança | Observação |
|------|---------|------------|
| 2026-04-11 | Versão inicial | Baseado na UI do Gemini Web em Abril 2026 |
