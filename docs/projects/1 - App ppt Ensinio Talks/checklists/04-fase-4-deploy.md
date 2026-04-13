# ✅ Checklist — Fase 4: Deploy & Teste

> **Objetivo:** Rodar o app local, testar offline, validar no projetor final e ter backup de segurança.

**Tempo estimado:** 30 min
**Criticidade:** 🔴 Alta — não pule esta fase, é o que evita acidente no palco

---

## 📦 Export do AI Studio

- [ ] Abrir o projeto no AI Studio
- [ ] Clicar em "Download Project" (ou equivalente) → arquivo .zip
- [ ] Descompactar em `~/CODE/Projects/ensinio-talks-fosc-app/`
- [ ] Abrir a pasta no VS Code pra conferir estrutura

---

## 🏗️ Build Local

- [ ] Abrir terminal na pasta do projeto
- [ ] Rodar `npm install`
  - [ ] Instalação concluiu sem erros
  - [ ] Nenhum warning crítico

- [ ] Alocar porta via port-manager (NUNCA fixe 3000):
```bash
eval $(node ~/aios-core/tools/port-manager.js auto ensinio-talks) && echo "Porta: $PORT"
```
- [ ] Porta anotada: _______

- [ ] Rodar dev server:
```bash
PORT=$PORT npm run dev
```
- [ ] Abrir no browser na URL mostrada
- [ ] App carrega sem erros

---

## 🔨 Build de Produção

- [ ] `npm run build` executa sem erros
- [ ] Pasta `dist/` (ou `build/`) foi criada
- [ ] Nenhum warning de bundle crítico
- [ ] Rodar preview do build:
```bash
eval $(node ~/aios-core/tools/port-manager.js auto ensinio-talks-preview) && PORT=$PORT npm run preview
```
- [ ] Preview funciona igual ao dev server

---

## 🔌 Teste Offline (CRÍTICO)

Este é o teste mais importante. O app DEVE funcionar sem internet.

- [ ] **Desligar Wi-Fi completamente**
- [ ] Recarregar a página no browser (Cmd+R)
- [ ] App ainda carrega? ____
- [ ] Navegar por todos os 8 Atos
- [ ] Todas as imagens carregam?
- [ ] Todos os vídeos tocam?
- [ ] Atalhos de teclado funcionam?
- [ ] Fullscreen funciona?

**Se algo quebrou offline:** há asset sendo buscado de CDN ou API externa. Conserte antes de ir pro palco. Procure por:
- Fontes do Google Fonts via CDN (baixa localmente)
- Imagens com URL externa (copia pra `/public/`)
- Fetch de dados em runtime (hardcode)

---

## 🖥️ Teste no Notebook Final

- [ ] Rodar no **notebook que vai pro auditório**
- [ ] Mesmo sistema operacional
- [ ] Mesmo browser que vai usar (Chrome? Safari?)
- [ ] Mesma resolução de tela
- [ ] Nível de bateria OK (ou plugado)

---

## 📽️ Teste no Projetor/TV

Se possível, teste no hardware real do auditório:

- [ ] Conectar ao projetor/TV
- [ ] Configurar como "extensão" ou "espelho" (o que vai usar)
- [ ] Verificar resolução do projetor
- [ ] Testar cores:
  - [ ] Dark mode fica legível no projetor
  - [ ] Amber aparece com intensidade suficiente
  - [ ] Texto branco tem contraste bom
- [ ] Testar fullscreen no display externo
- [ ] Navegar pelos slides

**Se as cores ficarem ruins:**
- Desligar eco-mode/power-save do projetor
- Aumentar brightness
- Em último caso, criar uma versão light-mode do app

---

## 📄 PDF Backup

Fallback de emergência:

- [ ] Abrir app no Chrome
- [ ] Cmd+P (ou Ctrl+P) → Preview de impressão
- [ ] Configurar: Layout Paisagem, Margens Mínimas, Background Graphics ON
- [ ] Salvar como `backup-slides.pdf` na pasta do projeto
- [ ] Abrir o PDF e conferir que tem todos os slides
- [ ] Copiar pra pendrive (por segurança redundante)
- [ ] (Opcional) Imprimir em papel

---

## 🎭 Ensaio Final

- [ ] Fazer a talk inteira cronometrada pelo menos 1x
- [ ] Anotar tempo total: ___ min
- [ ] Identificar slides onde tropeçou
- [ ] Identificar slides que precisam de mais tempo
- [ ] Testar transições de teclado em velocidade real
- [ ] Praticar as falas de momento-chave (Advisor Board, Forge, encerramento)

---

## 🎒 Check-in do Dia da Talk

Imprima ou salve em foto no celular:

```
LEVAR:
□ Notebook com app instalado LOCAL
□ Carregador do notebook
□ Adaptador HDMI/USB-C (pro projetor)
□ Apresentador/clicker wireless (opcional mas útil)
□ Pendrive com backup PDF
□ Garrafa d'água
□ O roteiro impresso (só como escudo psicológico)
```

---

## 🎯 Fase Concluída — Projeto Finalizado

- [ ] App roda offline no notebook final
- [ ] Testado em projetor (se possível)
- [ ] PDF backup salvo
- [ ] Ensaio feito pelo menos 1x
- [ ] Check-in do dia preparado

🏆 **Você está pronto pra subir no palco.**
