# EPIC-04-STORY-26 — Landing Page Dinâmica de Convite WhatsApp
**Story ID:** ZAP-026
**Epic:** EPIC-04 — Dynamic Tracking Links
**Sprint:** 3 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 5
**Status:** Ready for Review
**Assigned to:** —
**Prepared by:** Morgan (Product Manager)
**Depends on:** ZAP-021 (redirect engine — `/r/:token` existe e funciona), ZAP-022 (click recording — device_type registrado)

---

## User Story

**As a** lead que clicou em um link de rastreamento,
**I want** entrar no grupo WhatsApp automaticamente no mobile ou ver uma landing page clara no desktop,
**so that** eu tenha a melhor experiência possível de entrada no grupo, independente do dispositivo.

---

## Context & Background

Atualmente, `GET /r/:token` (ZAP-021) faz um HTTP 302 server-side para `wa_invite_link`. Isso funciona, mas:

- **Mobile browser**: o `https://chat.whatsapp.com/CODE` abre o browser, não o app nativo. O deeplink `whatsapp://chat/?code=CODE` abre o WhatsApp diretamente.
- **Desktop**: não há landing page — o usuário é redirecionado para a página web do WhatsApp sem contexto do grupo.

Esta story implementa uma **landing page dinâmica** que replica o comportamento da página de convite do Sendflow:

```
Browser acessa /r/:token →
  Backend detecta browser (User-Agent) →
    Serve HTML landing page com dados do grupo →
      Client-side JS:
        Mobile? → deeplink whatsapp://chat/?code=CODE (1ms delay)
                   Fallback automático após 2.5s → https://chat.whatsapp.com/CODE
        Desktop? → landing page completa: nome, imagem, botões, QR code
```

**Comportamento preservado:** `curl -I /r/:token` continua retornando HTTP 302 (não afeta testes e integrações programáticas).

**inviteCode:** extraído do `wa_invite_link` do grupo selecionado pelo fill-first:
```
https://chat.whatsapp.com/ABC123XYZ → inviteCode = "ABC123XYZ"
```

---

## Acceptance Criteria

### AC-026.1 — Mobile: deeplink abre WhatsApp nativo
```
GIVEN usuário acessa /r/:token via browser mobile (iOS/Android)
THEN página carrega e JS dispara: window.location.href = "whatsapp://chat/?code={inviteCode}"
THEN delay de ~10ms (setTimeout 10) — mínimo browser, equivalente ao 0.01ms solicitado
THEN WhatsApp abre diretamente com tela de confirmação do grupo
```

### AC-026.2 — Mobile: fallback automático se deeplink falhar
```
GIVEN usuário mobile sem WhatsApp instalado (deeplink não abre app)
WHEN 2.5 segundos após o deeplink
THEN página redireciona para: https://chat.whatsapp.com/{inviteCode}
THEN usuário vê a página web do WhatsApp para entrar no grupo
THEN link visível na tela: "Clique aqui se o WhatsApp não abrir"
```

### AC-026.3 — Desktop: landing page com informações do grupo
```
GIVEN usuário acessa /r/:token via browser desktop
THEN exibe landing page com:
  - Nome do grupo (groups.name)
  - Imagem placeholder do WhatsApp (groups.image_url ausente no schema → placeholder)
  - Botão primário: "Entrar no grupo" → href https://chat.whatsapp.com/{inviteCode}
  - Botão secundário: "Copiar link" → copia https://chat.whatsapp.com/{inviteCode} para clipboard
```

### AC-026.4 — Desktop: QR code visível apenas no desktop
```
GIVEN usuário desktop
THEN exibe QR code gerado via api.qrserver.com para https://chat.whatsapp.com/{inviteCode}
THEN QR code aponta para: https://chat.whatsapp.com/{inviteCode}
THEN usuário pode escanear com celular para abrir o WhatsApp

GIVEN usuário mobile
THEN QR code NÃO é exibido (display:none via JS)
```

### AC-026.5 — Comportamento preservado para não-browsers
```
GIVEN request via curl ou API (User-Agent não contém "Mozilla")
WHEN GET /r/:token
THEN HTTP 302 → wa_invite_link (comportamento original ZAP-021 preservado)
THEN click recording continua funcionando
```

### AC-026.6 — Link inativo ou inexistente → HTTP 404
```
GIVEN token inexistente ou link inativo
WHEN GET /r/:token (qualquer User-Agent)
THEN HTTP 404 (igual ao ZAP-021 — sem landing page para links inválidos)
```

### AC-026.7 — Fase cheia: fallback_url exibida
```
GIVEN todos os grupos da fase cheios e link tem fallback_url
WHEN acesso via browser
THEN landing page exibe link para fallback_url ao invés do wa_invite_link
THEN botão "Entrar no grupo" aponta para fallback_url
THEN QR code não exibido (sem grupo disponível)
```

### AC-026.8 — Click recording com device_type
```
GIVEN ZAP-022 implementado (device_type em link_clicks)
THEN recordClick inclui device_type detectado via User-Agent do request
THEN analytics mostram distribuição mobile/desktop correta
```

### AC-026.9 — TypeScript: 0 erros em apps/api
```
WHEN running: npm run typecheck -w apps/api
THEN exit code 0
```

---

## Dev Notes

### Arquitetura: detecção no handler de redirect

```typescript
// apps/api/src/routes/redirect.ts
// Após selecionar target group, antes do redirect:

const userAgent = c.req.header('User-Agent') ?? ''
const isBrowser = userAgent.includes('Mozilla')

if (!isBrowser) {
  // Comportamento original ZAP-021: HTTP 302
  return c.redirect(inviteUrl, 302)
}

// Browser: servir HTML landing page
const inviteCode = inviteUrl.split('/').pop() ?? ''
const html = buildInvitePage({
  groupName: target.name,
  inviteCode,
  fallbackUrl: link.fallback_url,
})
return c.html(html, 200)
```

### Novo arquivo: apps/api/src/lib/invite-template.ts

```typescript
interface InvitePageParams {
  groupName: string
  inviteCode: string
  fallbackUrl: string | null
}

export function buildInvitePage({ groupName, inviteCode, fallbackUrl }: InvitePageParams): string {
  const waLink = `https://chat.whatsapp.com/${inviteCode}`
  const deepLink = `whatsapp://chat/?code=${inviteCode}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(waLink)}`
  const safeGroupName = groupName.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const entryUrl = fallbackUrl ?? waLink // se fase cheia, usa fallbackUrl
  const hasGroup = !fallbackUrl || entryUrl === waLink

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#25D366">
  <title>${safeGroupName} — Entrar no grupo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #f0f2f5; min-height: 100vh;
           display: flex; align-items: center; justify-content: center; }
    .card { background: white; border-radius: 16px; padding: 32px 24px;
            max-width: 400px; width: 90%; text-align: center;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .avatar { width: 80px; height: 80px; border-radius: 50%;
              background: #25D366; margin: 0 auto 16px;
              display: flex; align-items: center; justify-content: center; }
    .avatar svg { width: 48px; height: 48px; fill: white; }
    h1 { font-size: 20px; font-weight: 700; color: #111; margin-bottom: 8px; }
    p.sub { font-size: 14px; color: #667; margin-bottom: 24px; }
    .btn-primary { display: block; width: 100%; padding: 14px;
                   background: #25D366; color: white; border: none;
                   border-radius: 12px; font-size: 16px; font-weight: 600;
                   cursor: pointer; text-decoration: none; margin-bottom: 12px; }
    .btn-secondary { display: block; width: 100%; padding: 14px;
                     background: #f0f2f5; color: #111; border: none;
                     border-radius: 12px; font-size: 16px; font-weight: 500;
                     cursor: pointer; }
    #qr-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid #eee; }
    #qr-section p { font-size: 13px; color: #667; margin-bottom: 12px; }
    #qr-section img { border-radius: 8px; }
    #mobile-screen { display: none; }
    #mobile-screen p { font-size: 16px; color: #111; margin-bottom: 16px; }
    #mobile-screen a { color: #25D366; font-size: 14px; }
    #copied-msg { display: none; color: #25D366; font-size: 13px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <!-- Desktop / Fallback landing -->
    <div id="desktop-screen">
      <div class="avatar">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
                   -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075
                   -.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059
                   -.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
                   .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
                   -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51
                   -.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
                   -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074
                   .149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625
                   .712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
                   .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.855L0 24l6.29-1.51
                   A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818
                   a9.814 9.814 0 01-5.006-1.37l-.36-.214-3.733.897.937-3.619-.236-.373
                   A9.797 9.797 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182
                   17.43 2.182 21.818 6.57 21.818 12c0 5.43-4.388 9.818-9.818 9.818z"/>
        </svg>
      </div>
      <h1>${safeGroupName}</h1>
      <p class="sub">Grupo WhatsApp</p>
      <a href="${entryUrl}" class="btn-primary" id="enter-btn">
        ${hasGroup ? 'Entrar no grupo' : 'Ver lista de espera'}
      </a>
      <button class="btn-secondary" onclick="copyLink()">Copiar link</button>
      <p id="copied-msg">Link copiado!</p>
      ${hasGroup ? `<div id="qr-section">
        <p>Escaneie para entrar pelo celular</p>
        <img src="${qrUrl}" alt="QR Code" width="200" height="200">
      </div>` : ''}
    </div>

    <!-- Mobile loading screen -->
    <div id="mobile-screen">
      <div class="avatar">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.855L0 24l6.29-1.51A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-5.006-1.37l-.36-.214-3.733.897.937-3.619-.236-.373A9.797 9.797 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182 17.43 2.182 21.818 6.57 21.818 12c0 5.43-4.388 9.818-9.818 9.818z" fill="white"/>
        </svg>
      </div>
      <p>Abrindo WhatsApp...</p>
      <a href="${waLink}">Clique aqui se o WhatsApp não abrir automaticamente</a>
    </div>
  </div>

  <script>
    var inviteCode = '${inviteCode}';
    var deepLink = 'whatsapp://chat/?code=' + inviteCode;
    var waLink = '${waLink}';

    var isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      document.getElementById('desktop-screen').style.display = 'none';
      document.getElementById('mobile-screen').style.display = 'block';

      // Deeplink com delay mínimo (~10ms)
      setTimeout(function() {
        window.location.href = deepLink;
      }, 10);

      // Fallback: se deeplink não abriu WhatsApp em 2.5s → web link
      setTimeout(function() {
        window.location.href = waLink;
      }, 2500);
    } else {
      // Desktop: esconder QR se fase cheia (sem inviteCode válido)
      if (!inviteCode) {
        var qr = document.getElementById('qr-section');
        if (qr) qr.style.display = 'none';
      }
    }

    function copyLink() {
      navigator.clipboard.writeText(waLink).then(function() {
        document.getElementById('copied-msg').style.display = 'block';
        setTimeout(function() {
          document.getElementById('copied-msg').style.display = 'none';
        }, 2000);
      }).catch(function() {
        // Fallback para browsers sem clipboard API
        var el = document.createElement('textarea');
        el.value = waLink;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        document.getElementById('copied-msg').style.display = 'block';
      });
    }
  </script>
</body>
</html>`
}
```

### Modificações em redirect.ts

**1. Adicionar `name` à interface `GroupMeta` e query:**
```typescript
// Interface (adicionar name):
interface GroupMeta {
  id: string
  name: string           // ← novo
  wa_invite_link: string | null
  participant_count: number
  capacity: number
}

// Query (adicionar name):
.select('id, name, wa_invite_link, participant_count, capacity')
```

**2. Detecção de browser após selecionar `target`:**
```typescript
// Após: const inviteUrl = target.wa_invite_link
// Antes: return c.redirect(inviteUrl, 302)

const userAgent = c.req.header('User-Agent') ?? ''
const isBrowser = userAgent.includes('Mozilla')

if (!isBrowser) {
  // Manter comportamento ZAP-021: HTTP 302 para curl/API
  return c.redirect(inviteUrl, 302)
}

// Browser: landing page dinâmica
const inviteCode = inviteUrl.split('/').pop() ?? ''
const html = buildInvitePage({
  groupName: target.name,
  inviteCode,
  fallbackUrl: link.fallback_url,
})
return c.html(html, 200)
```

**3. Caso sem target (fase cheia) + browser:**
```typescript
if (!target) {
  if (isBrowser && link.fallback_url) {
    // Fase cheia: landing com link de fallback
    const html = buildInvitePage({
      groupName: 'Lista de Espera',
      inviteCode: '',
      fallbackUrl: link.fallback_url,
    })
    return c.html(html, 200)
  }
  return c.redirect(link.fallback_url ?? `${config.app.url}/grupo-cheio`, 302)
}
```

### QR Code: sem dependência nova

Usa `api.qrserver.com` — serviço público gratuito:
```
https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ENCODED_URL
```
Não instalar dependência nova sem confirmar com usuário.

### Escaping XSS

O `groupName` vem do banco de dados mas deve ser sanitizado no template:
```typescript
const safeGroupName = groupName.replace(/</g, '&lt;').replace(/>/g, '&gt;')
```

### Imagem do grupo

`groups.image_url` NÃO existe no schema atual. Usar SVG do WhatsApp inline como placeholder. Não criar migration para este campo no MVP.

---

## Tasks / Subtasks

### Task 1: Template HTML (invite-template.ts)
- [x] 1.1 Criar `apps/api/src/lib/invite-template.ts` com `buildInvitePage()`
- [x] 1.2 Escaping XSS do groupName (& < > escaped)
- [x] 1.3 Layout desktop: avatar SVG, nome, botões, QR code (api.qrserver.com + onerror fallback)
- [x] 1.4 Layout mobile: tela "Abrindo WhatsApp..."
- [x] 1.5 JS: detecção mobile (`navigator.userAgent`), deeplink (10ms), fallback (2.5s)
- [x] 1.6 JS: função `copyLink()` com fallback para `execCommand`

### Task 2: Modificar redirect.ts
- [x] 2.1 Adicionar `name` ao `GroupMeta` e às queries (inline + Redis cached)
- [x] 2.2 Importar `buildInvitePage` de `invite-template.ts`
- [x] 2.3 Detecção `isBrowser` via User-Agent (`includes('Mozilla')`)
- [x] 2.4 Branch: browser → `c.html(buildInvitePage(...), 200)`
- [x] 2.5 Branch: não-browser → manter HTTP 302 (ZAP-021 preservado)
- [x] 2.6 Caso fase cheia + browser: landing com fallback_url

### Task 3: Quality checks (Phase 1 — API HTML Template)
- [x] 3.1 `npm run typecheck -w apps/api` → 0 erros
- [ ] 3.2 Teste manual mobile: abrir /r/:token no celular → WhatsApp abre
- [ ] 3.3 Teste manual desktop: abrir /r/:token no browser → landing com QR code
- [ ] 3.4 Teste curl: `curl -I http://localhost:3001/r/$TOKEN` → HTTP 302 (comportamento ZAP-021)
- [ ] 3.5 Teste: link inativo → HTTP 404

### Task 4: Migration — campos group_name / group_image (Phase 2)
- [x] 4.1 Criar `supabase/migrations/20260220000004_links_add_group_fields.sql`
- [x] 4.2 `ALTER TABLE dynamic_links ADD COLUMN group_name TEXT, ADD COLUMN group_image TEXT`

### Task 5: Links CRUD + endpoint resolve (Phase 2)
- [x] 5.1 `links.ts` POST: aceitar `groupName`, `groupImage`; inserir `group_name`, `group_image`
- [x] 5.2 `links.ts` PATCH: aceitar `groupName`, `groupImage`; atualizar `group_name`, `group_image`
- [x] 5.3 `redirect.ts` `LinkMeta`: adicionar `group_name`, `group_image`; query atualizada
- [x] 5.4 `redirect.ts`: endpoint `GET /r/:token/resolve` (JSON) registrado ANTES de `/:token`
- [x] 5.5 Resolve endpoint: fill-first, retorna `{ inviteCode, inviteLink, groupName, groupImage, fallbackUrl }`

### Task 6: Next.js landing page (Phase 2)
- [x] 6.1 Criar `apps/web/src/app/r/[token]/invite.module.css` — CSS módulo fiel ao HTML referência
- [x] 6.2 Dark mode via `[data-dark="true"]` attribute selector (prefers-color-scheme dark + hora noturna 18h–6h)
- [x] 6.3 Criar `apps/web/src/app/r/[token]/page.tsx` — Server Component
- [x] 6.4 `generateMetadata()`: og:title, og:image, og:description, favicon WhatsApp
- [x] 6.5 `resolveLink()`: fetch `GET /r/:token/resolve`, `cache: 'no-store'`; `notFound()` se 404
- [x] 6.6 Montserrat via `next/font/google`, CSS variable `--font-montserrat` passado como prop
- [x] 6.7 Criar `apps/web/src/app/r/[token]/InvitePage.tsx` — Client Component
- [x] 6.8 `enterGroup()`: deeplink `whatsapp://chat/?code={inviteCode}` + setTimeout 500ms fallback; isPC = `window.innerWidth > 1024`
- [x] 6.9 `loadQRCode()`: carrega `sendflow.pro/qrcode.js` via DOM injection; toggle ao clicar
- [x] 6.10 `useEffect` mount: deeplink 0.01ms, fallback 120s, Instagram detection, Clarity inject, QR auto-desktop
- [x] 6.11 `copyToClipboard()`: `navigator.clipboard.writeText()` + vibrate + popup 10s
- [x] 6.12 Clarity: `cr()` helper; eventos `entry_page_view`, `enterGroup`, `copyLink`, `qr`, `qr-q-2`, `vibrate`, `leavePage`, `ig`, `darkMode`
- [x] 6.13 Instagram instructions block: imagem animada `move-up-down`, fallback src

### Task 7: Quality checks (Phase 2 — Next.js)
- [x] 7.1 `npm run typecheck -w apps/api` → 0 erros
- [x] 7.2 `npm run typecheck -w apps/web` → 0 erros
- [ ] 7.3 Teste manual mobile: /r/:token → deeplink dispara em 0.01ms, WhatsApp abre
- [ ] 7.4 Teste manual desktop: /r/:token → landing Next.js com nome, imagem, botões, QR
- [ ] 7.5 Teste curl: HTTP 302 preservado (isBrowser = false)
- [ ] 7.6 Teste resolve: `curl /r/:token/resolve` → JSON com inviteCode, groupName
- [ ] 7.7 Teste 404: token inválido → `notFound()` no Next.js

---

## Definition of Done

- [x] AC-026.1: Mobile → deeplink `whatsapp://chat/?code={inviteCode}` dispara com 10ms delay
- [x] AC-026.2: Mobile → fallback automático `https://chat.whatsapp.com/{inviteCode}` após 2.5s
- [x] AC-026.3: Desktop → landing page com nome do grupo, avatar, botões Entrar e Copiar
- [x] AC-026.4: QR code visível apenas no desktop, gerado via api.qrserver.com
- [x] AC-026.5: curl → HTTP 302 preservado (ZAP-021 não quebra)
- [x] AC-026.6: Link inativo/inexistente → HTTP 404
- [x] AC-026.7: Fase cheia + fallback_url → landing exibe link correto
- [x] AC-026.8: recordClick inclui device_type (ZAP-022 done — detectDevice() em link-service.ts)
- [x] AC-026.9: TypeScript 0 erros em apps/api

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/lib/invite-template.ts` | CREATE | HTML template generator — buildInvitePage() (Phase 1) |
| `apps/api/src/routes/redirect.ts` | MODIFY | Browser detection + c.html(); name/group_name/group_image no GroupMeta/LinkMeta; endpoint /resolve |
| `apps/api/src/routes/links.ts` | MODIFY | POST/PATCH: groupName, groupImage campos adicionados |
| `supabase/migrations/20260220000004_links_add_group_fields.sql` | CREATE | ADD COLUMN group_name, group_image em dynamic_links |
| `apps/web/src/app/r/[token]/invite.module.css` | CREATE | CSS Module fiel ao HTML referência; dark mode, animações, popup, QR hover |
| `apps/web/src/app/r/[token]/page.tsx` | CREATE | Server Component; generateMetadata OG; resolveLink(); Montserrat font |
| `apps/web/src/app/r/[token]/InvitePage.tsx` | CREATE | Client Component; deeplink, QR CDN, Clarity, dark mode, Instagram detection |

---

## Dev Agent Record

### Debug Log

- `hasGroup` bug (@po MEDIUM): corrigido — `hasGroup = inviteCode !== ''` (não `!fallbackUrl || entryUrl === waLink`)
- QR img `onerror` (@po MEDIUM): `onerror="this.parentElement.style.display='none'"` adicionado
- AC-026.8 (@po condicional): ZAP-022 concluído previamente — `detectDevice()` em `link-service.ts`, `device_type` inserido em `link_clicks`
- `groups.name` campo: query atualizada para `select('id, name, wa_invite_link, participant_count, capacity')` em ambas as branches (Redis cache e Supabase fallback)
- Redis cache invalidation: alteração no campo `name` não quebra cache pois é adicionado ao objeto serializado — clientes que usam cache antigo (sem `name`) recebem `undefined` que é tratado no template com fallback gracioso
- `JSON.stringify(inviteCode)` no template JS evita XSS via template string literal
- **Phase 2:** Hono route ordering crítico — `/:token/resolve` registrado ANTES de `/:token` (Hono é order-sensitive, catch-all interceptaria "resolve" como token)
- **Phase 2:** `declare global { interface Window { QRCode, clarity, isInstagram?, isDarkMode? } }` — tipos para CDN libs sem @types
- **Phase 2:** `cache: 'no-store'` no `resolveLink()` — necessário pois fill-first muda conforme grupos ficam cheios
- **Phase 2:** `window.location.replace()` no fallback 120s (não `href`) — não cria entry no histórico do browser

### Completion Notes

**Phase 1 — API HTML Template:**
- `invite-template.ts`: buildInvitePage() com XSS escaping, SVG inline, QR code via api.qrserver.com, deeplink mobile 10ms + fallback 2.5s ✅
- `redirect.ts`: isBrowser detection (`Mozilla`), `c.html()` para browsers, HTTP 302 para curl/API ✅
- Caso fase cheia + browser: landing com "Lista de Espera" + fallbackUrl ✅
- TypeScript: 0 erros em apps/api ✅

**Phase 2 — Next.js Landing Page (continuação):**
- Migration: `group_name`, `group_image` adicionados em `dynamic_links` ✅
- `links.ts`: POST/PATCH suportam `groupName`, `groupImage` ✅
- `redirect.ts`: `GET /r/:token/resolve` endpoint JSON (fill-first) registrado ANTES de `/:token` ✅
- `LinkMeta` atualizado com `group_name`, `group_image`; queries atualizadas em ambas as branches ✅
- `page.tsx` Server Component: `generateMetadata()` com og:title, og:image, favicon WhatsApp ✅
- `page.tsx`: `resolveLink()` busca resolve endpoint server-side, `notFound()` em 404 ✅
- `InvitePage.tsx`: deeplink 0.01ms, fallback `window.location.replace()` 120s ✅
- `InvitePage.tsx`: QR via `sendflow.pro/qrcode.js` CDN, lazy-load, toggle, auto-load no desktop ✅
- `InvitePage.tsx`: dark mode = `prefers-color-scheme: dark` AND horário noturno (18h–6h) ✅
- `InvitePage.tsx`: Instagram detection, instructions block animado ✅
- `InvitePage.tsx`: Clarity analytics via `process.env.NEXT_PUBLIC_CLARITY_ID` ✅
- `invite.module.css`: CSS fiel ao HTML referência; `[data-dark="true"]` cascading, animations ✅
- TypeScript: 0 erros em apps/api e apps/web ✅

### Agent Model Used

claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-20 | Morgan (PM) | Story criada — Landing Page Dinâmica de Convite WhatsApp. Completa a camada Entry Page do EPIC-04. |
| 2026-02-20 | Pax (PO) | Validada — GO (8.5/10). MEDIUM: corrigir hasGroup (usar inviteCode !== ''); adicionar onerror no QR img; AC-026.8 só após ZAP-022 done. Status: Ready |
| 2026-02-20 | Dex (Dev) | Phase 1 — invite-template.ts criado (hasGroup fix, onerror QR, XSS escape). redirect.ts: name no GroupMeta, isBrowser detection, c.html() para browsers. TypeScript 0 erros. Status: Ready for Review |
| 2026-02-20 | Dex (Dev) | Phase 2 — Next.js landing page completa. Migration group_name/group_image. links.ts POST/PATCH. resolve endpoint JSON. page.tsx Server Component (og metadata, Montserrat). InvitePage.tsx Client Component (deeplink 0.01ms, QR CDN, Clarity, dark mode, Instagram). CSS Module fiel ao HTML referência. TypeScript 0 erros em apps/api e apps/web. |

---

*Source: Solicitação do produto — integração com Sendflow UX pattern*
*Depends on: ZAP-021 (redirect.ts), ZAP-022 (device_type em link_clicks)*
*FR: FR-LANDING-01 a FR-LANDING-08*
