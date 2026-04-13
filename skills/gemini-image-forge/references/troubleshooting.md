# Troubleshooting — Gemini Image Forge

Quando algo quebra, começa por aqui.

## 1. "Selectors not found" / "input_not_found" / "timeout_waiting_image"

**Causa mais comum:** Google atualizou a UI do Gemini Web e os seletores pararam de funcionar.

**Ação:**
1. Rode em modo debug pra ver o browser:
   ```bash
   node scripts/batch-generate.cjs --prompts ... --output ... --mode preflight --debug
   ```
2. Quando o script abrir o Chrome, abra DevTools (Cmd+Opt+I)
3. Inspecione o elemento que o script não encontrou
4. Copie o seletor estável (`aria-label` > `role` > tag custom > classe CSS)
5. Atualize `references/gemini-web-selectors.md` com o novo seletor
6. Atualize o array correspondente em `scripts/batch-generate.cjs`

## 2. "Not logged in" mesmo tendo logado

**Causa:** O perfil Chrome persistente em `~/.gemini-image-forge/chrome-profile` pode estar corrompido ou o cookie expirou.

**Ação:**
```bash
rm -rf ~/.gemini-image-forge/chrome-profile
node scripts/batch-generate.cjs --prompts ... --output ... --mode preflight
# Script abre Chrome, faz login manualmente, aperta ENTER
```

## 3. CAPTCHA no meio do batch

**Sintoma:** Script pausa, Chrome mostra verificação "Sou humano".

**Causa:** Google detectou padrão não-humano. Usualmente: batch muito rápido ou muitas gerações seguidas.

**Ação:**
1. Resolva o CAPTCHA manualmente no browser
2. Volte pro terminal e continue
3. **Preventivo:** aumente o delay entre imagens em `batch-generate.cjs` (procure por `15000 + Math.random() * 15000` e aumente)

## 4. `safety_filter` em vários items

**Sintoma:** Vários items marcados como `failed` com `reason: safety_filter`.

**Causa:** Nomes de pessoas reais, marcas registradas, ou conteúdo que Gemini considera sensível.

**Ação:**
```bash
# Sanitize os prompts primeiro
node scripts/sanitize-prompts.cjs --input prompts.json --verbose

# Use o arquivo sanitized no batch
node scripts/batch-generate.cjs --prompts prompts.sanitized.json --output ... --mode full
```

Se ainda falhar em items específicos, edite o prompt manualmente removendo:
- Nomes de figuras públicas vivas
- Marcas registradas específicas (Apple, Microsoft → "a tech company")
- Termos médicos/violência/conteúdo sensível

## 5. "download_failed" / imagens salvas como screenshot em vez de PNG original

**Causa:** O `src` da imagem é um blob que expirou ou um URL protegido por CORS.

**Ação:**
- Screenshot fallback já ativo no script — qualidade é boa pro propósito
- Se precisar do PNG original, aumente o `await sleep(2000)` pós-imagem (dá mais tempo pro blob carregar)

## 6. Imagem salva é a imagem ERRADA (contaminação entre prompts)

**Causa:** O script não clicou em "New chat" entre gerações, então o Gemini respondeu dentro do contexto anterior.

**Ação:**
1. Verifique seletor de "New chat" em `references/gemini-web-selectors.md`
2. Atualize se necessário
3. Workaround: rode com `--only` em grupos menores e reinicie o browser entre grupos

## 7. "Already logged in" mas página não carrega

**Causa:** gemini.google.com bloqueou temporariamente a conta (muitas requests).

**Ação:**
- Aguarde 1-2 horas
- OU troque para outra conta Google
- OU use uma VPN (último recurso)

## 8. "Playwright not installed"

```bash
cd ~/aios-core
npm install playwright
npx playwright install chromium
```

## 9. State file corrompido

**Ação:**
```bash
# Remove e reinicia — as imagens já salvas não serão regeradas (o script checa arquivo existente)
rm /path/to/output/.forge-state.json
```

## 10. Cota diária estourada

**Sintoma:** Mensagens tipo "Quota exceeded" ou "Try again later".

**Ação:**
- Google libera ~500 imagens/dia por conta no Gemini Web (grátis)
- Cota reseta em horário Pacífico (PT)
- Rode `--mode resume` amanhã pra continuar de onde parou

---

## Como saber se é bug do script ou mudança de UI

**É mudança de UI se:**
- Funcionou ontem, não funciona hoje
- Erro é "selector not found" ou "input not found"
- Você vê o Chrome abrir certinho mas nada acontece

**É bug do script se:**
- Nunca funcionou
- Erro é de JavaScript/Node (stack trace)
- Arquivos não são salvos apesar do console dizer sucesso

---

## Escalação

Se nada funcionar e você precisa das imagens pra ontem:

1. **Manual + prompts.json**: abra o `prompts.json`, copia prompt por prompt, cola no gemini.google.com, salva manual. Não é bonito, mas funciona.
2. **AI Studio**: https://aistudio.google.com — interface alternativa, também grátis
3. **Outro provider**: DALL-E 3 via OpenAI (paga), Midjourney (assinatura), Flux (self-hosted)
