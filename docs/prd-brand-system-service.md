# Brand System Service - Product Requirements Document (PRD)

**Version:** 1.2
**Date:** 2026-03-08
**Author:** Morgan (PM Agent)
**Status:** Reviewed

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-04 | 1.0 | Initial PRD creation based on extensive market research | Morgan (AIOS PM) |
| 2026-03-04 | 1.1 | Incorporated Architect (Aria) technical review conditions: added FR-9.x (prompt engineering pipeline), NFR-8.x (RLS testing, content moderation, webhook security), CON-13/14/15, adjusted automation estimates to conservative range (45-55% initial, 55-65% mature), added technical risks (API rate limits, Vercel domain cap, Figma sync direction, pilot phase buffer) | Morgan (AIOS PM) |
| 2026-03-08 | 1.2 | **MVP Simplification Release:** (1) Gestão operacional via ClickUp em vez de Client Portal proprietário; (2) Onboarding assistido por auditoria automática de presença digital existente; (3) Brand Book, Landing Pages e Sites static-first (HTML/CSS/JS), Next.js/CMS opcionais; (4) Entrega tripla do Brand Book: online + PDF + pacote local abrível por index.html; (5) Multi-tenant avançado movido para fase futura; (6) Programa de validação interna com projetos de referência antes de clientes reais; (7) Novos FRs (10.x, 11.x), NFRs (9.x), CONs (16-22) e Riscos adicionados | Morgan (AIOS PM) |

---

## Goals and Background Context

### Goals

- Deliver a complete, scalable digital presence service covering Brand Identity, Design System, and Creative Production for B2B clients
- Establish a 3-pillar MVP offering (Identidade Visual & Brand Book, Criativos, Landing Pages) with clear expansion path to 7+ additional pillars
- Achieve 45-55% time compression vs traditional agency delivery through AI-accelerated pipeline (maturing to 55-65% after prompt calibration across 20+ clients), while maintaining professional quality
- Position service between low-end DIY tools ($0-$59/mo) and high-end agencies ($50K+), targeting mid-market ($8K-$35K) with premium execution
- Create productized service tiers that scale profitably: Tier 1 ($8K), Tier 2 ($18K), Tier 3 ($35K), with monthly retainer add-on ($2.5K/mo)
- **[NEW v1.2]** Validate MVP through internal reference projects before commercial launch, ensuring operational readiness and product-market fit

### Background Context

The digital presence market is experiencing a clear gap between low-cost self-service platforms (Canva, Brandpad) and expensive full-service agencies (Pentagram, Collins). SMEs and scale-ups struggle to find mid-market services that deliver professional quality at accessible price points with reasonable timelines (3-6 months for traditional agencies).

Extensive market research has validated a R$830M global Brand Management Systems market growing at 8.5% CAGR, with the SME segment growing fastest at 18% CAGR but remaining underserved (only 35% of market). AIOS agents enable significant automation potential (45-55% reduction in human time initially, maturing to 55-65% after prompt calibration) across copy generation, design template production, and technical implementation, allowing us to compress timelines (3-4 weeks vs 8-12 weeks standard) and maintain healthy margins (63-74%) while pricing competitively. First 5 client projects are considered "pilot phase" with 50% time buffer over standard estimates to calibrate prompts and refine workflows.

The Dark Cockpit aesthetic of brand.aioxsquad.ai demonstrates technical feasibility and visual differentiation. The service will leverage existing AIOS orchestration capabilities and extend them with specialized production pipelines for brand assets, design tokens (W3C DTCG standard), creative templates, and deployment infrastructure.

**[NEW v1.2] MVP Simplification Philosophy:** The MVP prioritizes operational simplicity, portability, and validated delivery over advanced technical infrastructure. Client management via ClickUp, static-first deliverables (HTML/CSS/JS), and a formal internal validation phase ensure the service is proven before commercial launch. Advanced features (proprietary portal, CMS, multi-tenant runtime) are deferred to post-validation phases.

---

## Requirements

### Functional Requirements

#### Phase 1: Core Service Offering (Pillar 1-3 MVP)

**Pilar 1: Identidade Visual, Brand Book & Design System**

- **FR-1.1**: System shall guide clients through Brand Discovery Workshop (questionnaire format) capturing personality (5-point scales), visual preferences (mood selection), existing assets, competitors (URLs for analysis), and deliverable selection
- **FR-1.2**: System shall generate design tokens in W3C DTCG format with 3-tier architecture (primitive → semantic → component) exportable as CSS Custom Properties, SCSS variables, Tailwind config, and Figma Variables
- **FR-1.3**: System shall produce Logo System with minimum deliverables: primary horizontal, vertical/stacked, monogram/icon, favicon (multiple sizes), responsive versions (4+ breakpoints), negative/reversed, monochrome, with tagline variant, all exported in SVG, PNG (multiple resolutions), AI, EPS formats
- **FR-1.4**: System shall deliver Color Palette with primary (2-3), secondary (2-4), neutral scale (50-950 in 10 steps), semantic colors (success/warning/error/info in 5 tones each), and dark mode variants, with WCAG AA/AAA contrast compliance documentation
- **FR-1.5**: System shall provide Typography System with Display/Heading, Body/Interface, and Mono/Code font families, complete type scale (8-12 sizes with line-height and letter-spacing), responsive typography (CSS clamp values), and licensing documentation
- **FR-1.6**: System shall deliver Icon Set with base 40-80 icons at 24x24px grid, 2px stroke, rounded caps, exported as SVG and Figma Components, with optional extended set (120-200 icons) as icon font (WOFF2) or SVG sprite
- **FR-1.7**: **[REVISED v1.2]** System shall generate Brand Book as static website (HTML + CSS + JS) by default, with optional Next.js implementation when SSR/dynamic features are required. The Brand Book shall be deliverable in three formats: (1) published online version, (2) PDF export (50-100 pages), (3) portable local package openable via index.html without server dependencies. The static version shall use relative paths, embed all assets (fonts, images, CSS, JS), and support client-side search (Fuse.js). Reference site structure: Guidelines, Movement, Foundations, Logo, Icons, Moodboard, Brand Strategy, Components (auto-generated from tokens), Motion Guidelines, Templates
- **FR-1.8**: System shall provide Brand Voice Guide (8-12 pages) documenting personality (3-5 adjectives), voice pillars (3 core principles), tone spectrum by channel (formal to casual scale), do/don't list with examples, vocabulary bank (20-30 approved + 10-15 forbidden words)
- **FR-1.9**: System shall generate Manifesto (1 page) using Belief-Bridge-Bold framework and Value Proposition Canvas with headline, sub-headline, 3 benefit bullets, and anti-VP statement
- **FR-1.10**: System shall deliver 5-10 tagline options using 5 creation formulas (Direct Benefit, Metaphor, Contrast, Provocation, Identity) with rationale for final selection
- **FR-1.11**: System shall create Figma Component Library with minimum 60 base components across categories: Primitives (Button, Input, Select, Checkbox, Radio, Toggle), Feedback (Alert, Toast, Badge, Progress, Skeleton, Spinner), Navigation (Navbar, Sidebar, Tabs, Breadcrumbs, Pagination, Menu), Data Display (Table, Card, List, Avatar, Tag, Tooltip, Popover), Layout (Container, Grid, Stack, Divider, Spacer), Overlay (Modal, Drawer, Command Palette), Forms (Date Picker, Time Picker, File Upload, Color Picker, Slider), Advanced (Accordion, Stepper, Timeline, Tree View, Data Chart, Code Block), with variants for size, state, and configuration resulting in 200-400 total variants
- **FR-1.12**: **[REVISED v1.2]** Multi-tenant deployment via subdomain routing (acme.brand.aioxsquad.ai) with runtime token injection is OPTIONAL in MVP. Default deployment is per-client static hosting (Vercel, Netlify, or any static host). Multi-tenant architecture deferred to Phase 2 post-validation
- **FR-1.13**: System shall provide Grid System documentation with breakpoints (xs/sm/md/lg/xl/2xl), column counts (4/8/8/12/12/12), gutter sizes (16-32px), and margin specifications per breakpoint

**Pilar 2: Criativos (Posts, Carrosséis, Stories, Thumbnails)**

- **FR-2.1**: System shall generate Social Media Post Templates for platforms: Instagram Feed (1080x1080 square, 1080x1350 4:5), Facebook Feed (1200x630), LinkedIn (1200x644), X/Twitter (1200x675), Pinterest (1000x1500), with 5-8 layout variants per format (Quote, Tip, Statistic, Before/After, Question, Announcement, Behind-the-scenes, Testimonial)
- **FR-2.2**: System shall create Instagram/LinkedIn Carousel Templates (1080x1350px, 2-10 slides) with slide types: Cover (hook), Content (numbered points), Summary, CTA + Branding, with continuity elements (arrows, slide numbers, progress dots)
- **FR-2.3**: System shall produce Story/Reel Templates (1080x1920px 9:16) for Instagram, Facebook, TikTok with variants: Poll, Quiz, Behind-the-scenes, Testimonial, CTA/Link, ensuring content stays within safe zone (10% from edges)
- **FR-2.4**: System shall deliver YouTube Thumbnail Templates (1280x720px 16:9, max 2MB) with variants: Standard, Face-focused (30-40% face area), Bold Text (5-7 words max), Comparison, Branded Series, all respecting safe zone for overlays
- **FR-2.5**: System shall generate Profile Covers & Banners: Instagram Highlights (1080x1920 with 110x110 icon area), LinkedIn Personal (1584x396), LinkedIn Company (1128x191), X/Twitter Header (1500x500), YouTube Channel Banner (2560x1440 with 1546x423 safe area), Facebook Cover (820x312), TikTok Banner (1200x300)
- **FR-2.6**: System shall provide Content Calendar Template structure with 4-week rotation: Week 1 (Educational 40%), Week 2 (Authority 25%), Week 3 (Engagement 15%), Week 4 (Conversion 10% + Promotional 10%), with content pillars mapped per industry vertical
- **FR-2.7**: System shall implement batch creative generation pipeline: intake content brief → AI copy generation (Claude API) → AI image generation (Flux 1.1 Pro/DALL-E 3 where applicable) → template rendering (Satori JSX-to-SVG) → rasterization (Sharp) → export to review queue, with estimated 8 minutes for 30 posts vs 15-20 hours manual
- **FR-2.8**: System shall export all social creatives in platform-specific formats: PNG for static images, MP4 (H.264) for videos with max file sizes per platform (Instagram 30MB video, Facebook 4GB, LinkedIn 5GB, YouTube 128GB, TikTok 287MB)
- **FR-2.9**: System shall generate Caption Copy for posts using HCEA framework (Hook, Context, Entrega/Value, Action/CTA) with 150-300 words, including 8-12 hashtags mixing niche (<50K posts), medium (50K-500K), and broad (500K+) reach
- **FR-2.10**: System shall create Carrossel Caption using same HCEA framework with content summary in bullet format and complementary CTAs (save, share, comment, link)

**Pilar 3: Landing Pages e Sites Completos**

- **FR-3.1**: System shall deliver Landing Page Copy (1500-3000 words) structured per Conversion Architecture framework with 8 mandatory sections: Hero (pre-headline + H1 + sub-headline + primary CTA + social proof), Problem (pain agitation with 3-4 symptom bullets), Solution (features with benefits), How It Works (3-4 step process), Social Proof (testimonials + metrics), Pricing/Tiers (if applicable), FAQ (5-8 objection-addressing questions), Final CTA (urgency + risk removal)
- **FR-3.2**: System shall create Landing Page Design with wireframe (low/mid-fi), UI design for 3 breakpoints (1440px desktop, 768px tablet, 375px mobile), interactive Figma prototype, and design specs via Figma Dev Mode for developer handoff
- **FR-3.3**: System shall provide Site Institucional (5-10 pages) with page types: Home (hero, features, about, testimonials, CTA, footer), Sobre/About (story, team, values, timeline, numbers), Servicos/Products (grid, detail cards, process), Portfolio/Cases (gallery, filters, detail template), Blog Listing (grid/list, categories, search, pagination), Blog Post (content, author, related, share), Contato (form, map, info), Pricing (comparison, FAQ), Termos/Privacidade (long-form with TOC), 404 (illustration, search, links)
- **FR-3.4**: System shall implement responsive web design adhering to specifications: max content width 1200-1440px, min touch target 44x44px mobile, max line length 65-75 characters, vertical rhythm on 8px base grid
- **FR-3.5**: **[REVISED v1.2]** Landing Pages and Institutional Sites shall be delivered as static HTML + CSS + JS by default, deployable to any static hosting (Vercel, Netlify, GitHub Pages, any web server). CMS integration (Payload CMS 3.x or similar) is OPTIONAL, used only when client requires frequent content updates. When CMS is needed, Payload CMS self-hosted in Next.js /app folder with role-based access control and draft/publish workflow
- **FR-3.6**: **[REVISED v1.2]** Static sites shall be deployable to any hosting platform. When using Vercel, on-demand ISR (Incremental Static Regeneration) is available for CMS-enabled sites triggered by Payload webhooks. For static-only sites, deployment is simple file upload or Git-based CI/CD. Custom domain support via CNAME for all hosting options
- **FR-3.7**: System shall generate SEO metadata for all pages: Meta Title (<60 chars with keyword), Meta Description (<155 chars with CTA), H1 (aligned with title), H2-H6 hierarchy (3-7 per page with secondary keywords), Alt Text (descriptive + keyword when natural), URL slugs (kebab-case), internal links (2-3 per page with keyword anchors)
- **FR-3.8**: System shall provide Microcopy Guide documenting: Button labels (action + benefit, no generic "Submit"), Form labels (specific, e.g., "Email profissional"), Placeholders (real examples), Error messages (specific + solution), Empty states (guidance), Loading states (expectation-setting), Success confirmations (next step), 404 pages (recovery options), Cookie banners (transparency + brevity)
- **FR-3.9**: System shall generate Bio Link Page (Linktree-style, 1080x1920 mobile-first) with brand-matched design, configurable link blocks, social icons, and optional banner/avatar
- **FR-3.10**: System shall deliver Thank You/Confirmation pages for all conversion points with next-step CTAs and optional tracking pixels

#### Phase 2: Expansion Pillars (Post-MVP)

**Pilar 4: Email Marketing**

- **FR-4.1**: System shall generate Email Newsletter Template (600px wide max, 1500-2500px height, <102KB for Gmail) using MJML/react-email with sections: pre-header text, header (logo + nav), hero banner (600x300px), 2-3 content blocks, CTA button (min 44px height), social links, footer (unsubscribe + address + legal), responsive for 320-480px mobile
- **FR-4.2**: System shall create Email Welcome Sequence (5 emails) with: Email 1 (immediate delivery, welcome + promised resource), Email 2 (Day +2, educational value/case), Email 3 (Day +4, social proof/testimonial), Email 4 (Day +7, objection handling), Email 5 (Day +10, decision/urgency), each 150-400 words with 3 subject line options per email
- **FR-4.3**: System shall provide Transactional Email Templates for: Cadastro confirmation (400-600px height), Password reset (300-400px), Order confirmation (800-1200px), Invoice/Receipt (600-900px), Delivery status (500-700px), all using table-based HTML for email client compatibility
- **FR-4.4**: System shall deliver Email Promotional Templates (600x600-1200px) for: Product Launch, Promotion/Discount, Event/Webinar, Seasonal/Holiday, Re-engagement, with 2+ CTA placements (above + below fold)
- **FR-4.5**: System shall generate Email Signature HTML template (600px max width, 150-200px height) with: name + role, phone + email, company logo (120-200px wide), social icons (20x20px), optional promotional banner (600x100px), disclaimer text
- **FR-4.6**: System shall integrate with ESP (Resend API primary, Brevo fallback) for delivery, with support for: transactional sends, broadcast campaigns, scheduled sequences, analytics webhooks, bounce/complaint handling
- **FR-4.7**: System shall provide A/B testing framework for Email Subject Lines with 3 variants per send using formulas: Number + Benefit, Question, How + Result, Urgent/Temporal, Personalized, Contraintuitivo, Specific Result, Story

**Pilar 5: Ads Criativos**

- **FR-5.1**: System shall generate Meta Ads creative sets (Facebook/Instagram) in formats: Feed Square (1080x1080), Feed Vertical (1080x1350 4:5), Feed Horizontal (1200x628 1.91:1), Story/Reel (1080x1920 9:16), Carousel Card (1080x1080), Collection Cover (1200x628), Instant Experience (1080x1920), with 3-5 copy variants per creative (short <50 words, medium 50-125, long 125-250) using angles: Dor, Desejo, Curiosidade, Prova, Autoridade
- **FR-5.2**: System shall create Google Display Ads in all IAB standard sizes: Medium Rectangle (300x250), Leaderboard (728x90), Wide Skyscraper (160x600), Half Page (300x600), Large Rectangle (336x280), Mobile Banner (320x50), Large Mobile Banner (320x100), Billboard (970x250), max 150KB PNG/JPG, plus Responsive Display Ads with 1-5 headlines (30 chars), 1-5 descriptions (90 chars), landscape image (1.91:1), square image (1:1), logo (1:1 and 4:1)
- **FR-5.3**: System shall produce Google Search Ad copy with Responsive Search Ad format: 10+ headline variations (max 30 chars each), 4+ description variations (max 90 chars each), following best practices for keyword insertion, CTA clarity, and benefit communication
- **FR-5.4**: System shall deliver YouTube Ads in formats: TrueView In-Stream (1920x1080, 15-30s skippable at 5s), Bumper (1920x1080, 6s non-skippable), Discovery Ad Thumbnail (1280x720 static), Masthead (1920x1080 auto-play 30s), Companion Banner (300x250 static), with full video editing or motion graphics production
- **FR-5.5**: System shall generate LinkedIn Ads: Single Image (1200x627 1.91:1), Carousel Card (1080x1080), Video (1920x1080 or 1080x1080), Message Ad Banner (300x250), Dynamic Ad logo (100x100)
- **FR-5.6**: System shall create TikTok In-Feed Video Ads (1080x1920 9:16), Pinterest Promoted Pins (1000x1500 2:3), X/Twitter Image Ads (1200x675 16:9) and Carousel (800x418 per card)
- **FR-5.7**: System shall implement Ad Copy A/B Testing pipeline with minimum 2-3 variants per campaign, auto-generating variations across: headline, primary text length, visual style, CTA wording
- **FR-5.8**: System shall provide Pixel/Tracking setup documentation and implementation for: Meta Pixel (event configuration), Google Ads conversion tracking (tag + actions), UTM parameter strategy (campaign/source/medium/content/term), retargeting audience definitions

**Pilar 6: Video & Motion Graphics**

- **FR-6.1**: System shall deliver Logo Animation (2D) using Remotion (React-based video): 3-5 second reveal animation, 1920x1080px at 30/60fps, exported as MP4, MOV, GIF, and Lottie JSON, with seamless loop variant (3-8 seconds) and quick stinger (1-2 seconds) for transitions
- **FR-6.2**: System shall produce Video Intro/Outro templates for YouTube (1920x1080): Intro (5-10s with branded animation), Outro (15-20s with end cards and subscribe CTA), using brand tokens for colors, fonts, and logo integration
- **FR-6.3**: System shall create Social Media Motion Templates using After Effects or Remotion: Story Animated (1080x1920, 60fps, 5-15s), Post Animated Feed (1080x1080, 30fps, 5-15s), Reel/TikTok Template (1080x1920, 30fps, 15-60s), Carousel Animated (1080x1350, 30fps, 30-60s), Quote Animation (1080x1080, 5-10s), Countdown/Teaser (1080x1920, 5-15s), all exported as MP4 and editable project files (AEP/Remotion compositions)
- **FR-6.4**: System shall generate Lower Thirds & Overlays for video production: Lower Third Name (1920x1080 with alpha, 3-5s), Lower Third Title (1920x1080 with alpha, 3-5s), Subscribe Button Overlay (1920x1080, 5-8s), Social Icons Overlay (1920x1080, 3-5s), Bug/Watermark (200x200 static or loop), Progress Bar (1920x1080 with alpha), all exported as MOV ProRes 4444 with transparency and AEP source
- **FR-6.5**: System shall provide Custom Brand Transitions (4-6 variations) for video editing: Wipe Transitions (0.5-1s), Shape Transitions (0.5-1.5s), Glitch Transitions (0.3-0.8s), Zoom/Scale Transitions (0.5-1s), Brand-specific Transition (0.5-1.5s), all with alpha channel in MOV format
- **FR-6.6**: System shall deliver Explainer Video production (60-90s) if requested in premium tier: script generation (Claude API), voiceover (ElevenLabs AI), asset assembly (brand tokens + AI images), animation (Remotion), background music (licensed library), final export (MP4 H.264 1080p, WebM VP9, optional 4K)
- **FR-6.7**: System shall create GIF/Sticker packs: Reaction GIFs 5-8 (480x480px, <5MB, 2-4s loop), Sticker Pack 10-15 (512x512 transparent), Loading Animation (200x200 seamless loop), Animated Emoji 5-8 (128x128), optimized for GIPHY/Tenor platforms
- **FR-6.8**: System shall implement Motion Token integration in all video templates, reading from brand tokens: colors (primary/secondary/surface), fonts (display/body/mono), motion.easing (cubic-bezier curves), motion.duration (fast/medium/slow in ms), ensuring all motion work uses client brand styling

**Pilar 7: Materiais Corporativos**

- **FR-7.1**: System shall generate Pitch Deck Template (16:9, 1920x1080px, 15-25 slides) with master slide layouts for: Capa, Agenda, Problema, Solucao, Produto/Demo, Mercado (TAM/SAM/SOM), Modelo de Negocio, Traction/Metricas, Competicao, Time, Roadmap, Financeiro, Ask/CTA, Contato, exported as Figma, PowerPoint (PPTX), Google Slides, Keynote, and PDF
- **FR-7.2**: System shall create Proposta Comercial Template (A4 210x297mm or US Letter 216x279mm, 8-15 pages) structured: Capa, Sobre nos, Entendimento do problema, Solucao proposta, Escopo de trabalho, Timeline, Investimento, Cases/Portfolio, Depoimentos, Termos e condicoes, Proximos passos, Contracapa, exported as Figma, InDesign, Google Docs template, DOCX, PDF
- **FR-7.3**: System shall deliver Cartao de Visita design (90x50mm Brazil or 89x51mm US standard, 300 DPI with 3mm bleed, 5mm safe area) with variants: frente/verso padrao, versao vertical, versao com foto, versao minimalista, exported as AI, PDF print-ready, Figma, plus Digital vCard (HTML with QR code, PNG)
- **FR-7.4**: System shall provide Papelaria suite: Timbrado/Letterhead (A4 with 3mm bleed), Envelope (C4 229x324mm, DL 110x220mm), Pasta/Folder (A4 with flap, 480x330mm open), Nota Fiscal/Invoice template (A4), Carimbo/Stamp (47x18mm or 60x40mm), Cracha/Badge (86x54mm credit card size), Certificado (A4 landscape 297x210mm), all exported as AI, PDF, plus DOCX templates where applicable
- **FR-7.5**: System shall generate Email Signature (HTML, 600px max width, 150-200px height) with elements: name + role, phone + email, company logo (120-200px), social icons (20x20px), optional promotional banner (600x100px), disclaimer text, exported as HTML with inline CSS and image assets
- **FR-7.6**: System shall create Apresentacao Institucional (16:9, 20-40 slides) distinct from Pitch Deck, focusing on: Historia da empresa, Missao/Visao/Valores, Estrutura organizacional, Portfolio completo, Processo de trabalho, Clientes e parceiros, Numeros e conquistas, exported in PowerPoint, Google Slides, Keynote, Figma
- **FR-7.7**: System shall deliver One-Pager/Executive Summary template (single A4 page) with sections for company overview, key services, unique value proposition, social proof, contact, designed for print and digital distribution
- **FR-7.8**: System shall provide Case Study Template (4-6 pages) structured: Cliente/Context, Desafio, Solucao implementada, Resultados (metricas), Depoimento, Proximos passos, with photo placeholders and data visualization elements

#### Cross-Cutting Requirements

**[REVISED v1.2] Client Operations via ClickUp**

- **FR-8.1**: **[REVISED v1.2]** Client operations shall be managed via ClickUp workspace in MVP, replacing proprietary Client Portal. ClickUp shall handle: project onboarding (intake forms), briefing collection, timeline/status tracking, deliverables organization, QA checklists, client approvals (via task comments/custom fields), change requests, revision tracking, and retainer operations. Proprietary Client Portal is deferred to Phase 2 post-validation
- **FR-8.2**: **[REVISED v1.2]** Client Onboarding Flow shall support two modes: (A) Standard Mode - Phase 1 Intake (15min multi-step wizard via ClickUp Form or Tally: company basics, brand personality 5-point scales, visual preferences, asset upload, competitor URLs, deliverable selection); (B) Audit-Assisted Mode - client provides existing digital presence URLs for automated analysis before discovery workshop. Both modes proceed to: Phase 2 AI Analysis (30min automated), Phase 3 Human Review (45min internal), Phase 4 Client Approval (30min via ClickUp), Phase 5 Setup (automated <5min: generate token files, create asset folders, send credentials)
- **FR-8.3**: System shall store all client assets in Cloudflare R2 (S3-compatible) with folder structure: `r2://brand-assets/{client-id}/` with subdirectories: brand-book/, social/, video/, web/, email/, tokens/, source/, with signed URLs (15min expiry) for secure downloads. Asset links shared via ClickUp tasks or direct delivery
- **FR-8.4**: System shall implement version control for all deliverables: brand book (Git tags v1.0, v1.1), design tokens (Semver in JSON), social creatives (sequential post-001, post-002), videos (Semver v1.0, v1.1), landing pages (Git tags + deploy URLs), email templates (Semver), with rollback capability to any previous version
- **FR-8.5**: **[REVISED v1.2]** Quality Review shall use ClickUp checklists before client delivery: Brand Voice consistency, Color contrast (WCAG AA minimum), Typography hierarchy correctness, Responsive design validation (3+ breakpoints), Accessibility compliance (WCAG AA for web, alt text for images), Copy quality (grammar, brand voice, no forbidden words), Link functionality, File format correctness, File size limits per platform
- **FR-8.6**: **[REVISED v1.2]** Project metrics shall be tracked via ClickUp dashboards and custom fields: project timeline (planned vs actual), deliverables status (draft/review/approved/delivered), approval velocity (time to approval), change requests (count + resolution time), client satisfaction score (via post-delivery survey)
- **FR-8.7**: **[REVISED v1.2]** Revision Management via ClickUp: up to 3 revision rounds included in tier pricing, tracked via task comments and custom fields: revision number, items changed, change reason, resolution date. Workflow: client requests changes (ClickUp comment) → items return to Draft status → internal team revises → resubmit to Review → client re-approves
- **FR-8.8**: System shall deliver Asset Organization with naming convention `{client-slug}/` with folders: 01-brand-identity/ (logo/, colors/, typography/, icons/, patterns/, photography/, illustration/), 02-design-system/ (tokens/, figma/, docs-site/), 03-social-media/ (instagram/, linkedin/, youtube/, twitter-x/), 04-web-design/ (wireframes/, ui-design/, prototypes/), 05-email/, 06-corporate/, 07-motion/, 08-ads/, 09-exports/ (print-ready/ CMYK 300dpi, web/ RGB 72dpi optimized, social/ per-platform)
- **FR-8.9**: System shall provide Training & Enablement deliverables: Brand Usage Training session (1-2h teaching team brand application), Website Training (content updates via static file editing or CMS when applicable), Social Media Training (template usage, scheduling, engagement guidelines), Design System Onboarding (for developers: tokens, components, implementation), with recorded video walkthroughs (Loom) for asynchronous viewing
- **FR-8.10**: System shall generate Handoff Documentation for: Design-to-Code (Figma Dev Mode specs with spacing, colors, fonts, states), Brand Voice Guide (for copywriters), Content Calendar Template (editorial pillars, posting frequency), SEO Strategy Document (keyword research, on-page optimization checklist, internal linking strategy), Technical Documentation (deployment instructions for static hosting, token build pipeline)

#### Prompt Engineering & AI Quality Pipeline

- **FR-9.1**: System shall maintain a Prompt Template Library with versioned prompts per deliverable type (brand voice guide, social post, landing page copy, email sequence, ad copy, video script, etc.), stored as structured templates with variables for client context injection (brand personality, industry, tone, vocabulary bank), using semantic versioning (v1.0, v1.1) with changelog per prompt template
- **FR-9.2**: System shall implement a prompt quality scoring pipeline: AI generates output, human reviewer rates quality on 5-point scale across dimensions (brand voice adherence, factual accuracy, tone appropriateness, CTA effectiveness, creativity), prompt iteration cycle continues until average score >= 4.0 across all dimensions before prompt is promoted to production
- **FR-9.3**: System shall support prompt calibration workflow per client: initial prompt customization using Brand Discovery Workshop outputs (personality, vocabulary, tone spectrum), A/B testing capability comparing prompt variants on same input, performance tracking per prompt version (acceptance rate, revision requests, quality scores), automatic selection of best-performing prompt variant after minimum 10 evaluations

#### [NEW v1.2] Automated Digital Presence Audit

- **FR-10.1**: System shall support Audit-Assisted Onboarding where client or team provides URLs and public profiles for existing digital presence: institutional website, landing pages, YouTube channel, LinkedIn company/personal, Instagram, Facebook, TikTok, X/Twitter, and other relevant public URLs
- **FR-10.2**: System shall perform automated analysis of provided URLs generating an Initial Brand Audit Report including: current perceived positioning, tone of voice analysis, messaging consistency analysis, visual consistency analysis (colors, typography, imagery style), improvement opportunities, and competitive gap assessment
- **FR-10.3**: System shall generate AI-assisted drafts from audit findings: draft Brand Voice Guide (based on existing content tone), draft Messaging Framework (based on existing value propositions), draft Moodboard/Visual Direction (based on existing visual patterns and improvement opportunities), draft suggestions for website, landing pages, and social channels
- **FR-10.4**: All audit-generated inferences and drafts shall be clearly labeled as "AI Draft - Requires Human Validation" and shall NOT become official brand direction without explicit human review and client approval. Audit findings are strategic support, not replacement for discovery workshop
- **FR-10.5**: System shall handle incomplete, inconsistent, or outdated source content gracefully: flag data quality issues in audit report, indicate confidence levels for inferences, highlight conflicts between current signals and likely desired positioning, recommend discovery workshop focus areas based on gaps identified

#### [NEW v1.2] Internal Validation Program

- **FR-11.1**: MVP shall be validated through an Internal Validation Program with multiple reference projects before commercial client use. Reference projects shall use the same operational structure, tools, and workflows planned for real clients
- **FR-11.2**: Reference projects shall include diverse profiles: different business types, varying brand maturity levels (new brand vs rebrand), different quality levels of existing digital presence (strong vs weak vs none), different tier levels (Tier 1, 2, 3 simulation)
- **FR-11.3**: Each reference project shall exercise the full workflow: onboarding (standard and audit-assisted modes), discovery, AI draft generation, production, QA gate, revision cycles, and final delivery including Brand Book (online + PDF + local package), Landing Pages (when applicable), and Sites (when applicable)
- **FR-11.4**: System shall maintain a Validation Learnings Registry documenting: gaps identified, process improvements needed, prompt adjustments required, template refinements, checklist updates, operational friction points, and product enhancement opportunities discovered during each reference project
- **FR-11.5**: Learnings from validation shall feed back into backlog: MVP scope adjustments, post-MVP backlog items, prompt library updates, template improvements, checklist refinements, and documentation updates. Classification: (A) MVP-blocking fixes, (B) Post-MVP backlog, (C) Client-specific customizations not to be productized
- **FR-11.6**: Reference projects shall NOT use a simplified or parallel architecture. They must validate the definitive MVP structure to ensure production readiness

### Non-Functional Requirements

**Performance & Scalability**

- **NFR-1.1**: AI-assisted pipeline shall reduce production time by 45-55% vs manual process across copy generation, template rendering, and technical setup (maturing to 55-65% after prompt calibration across 20+ client projects)
- **NFR-1.2**: **[REVISED v1.2]** Brand Book deployment shall complete within 5 minutes of final approval: static version via file upload or Git push to any hosting platform; Next.js version (when used) via Vercel automatic deployment
- **NFR-1.3**: Batch creative generation (30 social media posts) shall complete within 10 minutes: AI copy generation ~2min parallel, AI image generation ~5min parallel, template rendering ~2min batch, exports ~1min
- **NFR-1.4**: **[REVISED v1.2]** System shall support 10-50 concurrent client projects in Phase 1 (Year 1) using simplified architecture: per-client static hosting, shared Cloudflare R2 storage, ClickUp workspace for operations. Advanced multi-tenant architecture deferred to Phase 2
- **NFR-1.5**: **[REVISED v1.2]** ClickUp workspace and all client-facing deliverables (Brand Book, Landing Pages) shall load within 2 seconds (P95)
- **NFR-1.6**: Asset download URLs (signed R2 URLs) shall be generated on-demand with expiration: 15 minutes for API access and asset previews, 1 hour for asset download URLs (to accommodate large brand asset packages on slower connections)

**Quality & Compliance**

- **NFR-2.1**: All web deliverables (landing pages, brand book sites) shall achieve WCAG AA compliance minimum with color contrast ratio 4.5:1 for normal text, 3:1 for large text/UI components
- **NFR-2.2**: Design tokens shall follow W3C Design Tokens Community Group (DTCG) specification version 2025.10 stable, ensuring tool-agnostic interchange format
- **NFR-2.3**: All logo deliverables shall be vector-first (SVG as primary format) scalable without quality loss, with raster exports (PNG) at 1x, 2x, 3x resolutions minimum for retina display support
- **NFR-2.4**: Social media creative exports shall meet platform specifications: Instagram max 30MB video, Facebook max 4GB video, YouTube max 128GB video, TikTok max 287MB video, with appropriate codec (H.264 for broad compatibility)
- **NFR-2.5**: Email templates shall remain under 102KB total size to avoid Gmail clipping, using table-based HTML layout for email client compatibility (Outlook, Gmail, Apple Mail, mobile clients)
- **NFR-2.6**: **[REVISED v1.2]** Client data isolation in MVP via folder-based separation in R2 storage and ClickUp workspace permissions. Supabase RLS-based multi-tenancy deferred to Phase 2 when proprietary portal is implemented
- **NFR-2.7**: Brand assets shall be backed up daily to secondary storage with 30-day retention, allowing disaster recovery within 24 hours

**Usability & Developer Experience**

- **NFR-3.1**: Client Onboarding questionnaire shall be completable in 15 minutes maximum with progress save/resume capability
- **NFR-3.2**: **[REVISED v1.2]** All client-facing deliverables (Brand Book, Landing Pages, Sites) shall be mobile-responsive supporting viewport widths 320px-1920px with touch-friendly controls (min 44x44px tap targets)
- **NFR-3.3**: Design tokens shall be exportable in multiple formats from single source: CSS Custom Properties, SCSS variables, Tailwind config TypeScript, JSON, Figma Variables, enabling any tech stack adoption
- **NFR-3.4**: Component Library (Figma) shall use Auto Layout for all components enabling easy content/text changes without breaking layout
- **NFR-3.5**: Brand Book documentation site shall support full-text search across all sections with instant results (<500ms) via client-side search (Fuse.js or similar), working both online and in local package
- **NFR-3.6**: Template files (Figma, PPTX, DOCX) shall include embedded instructions/guidelines as comments enabling self-service usage by client teams
- **NFR-3.7**: **[REVISED v1.2]** Static site generation and asset export shall complete within reasonable time. No real-time API dependency for delivered assets

**Cost & Operational Efficiency**

- **NFR-4.1**: **[REVISED v1.2]** Infrastructure cost per active client project shall remain under $100/month in MVP (reduced from $200 due to simpler architecture): static hosting (free-$20), Cloudflare R2 storage (~$5-10), AI API usage (~$50-80), ClickUp (shared workspace)
- **NFR-4.2**: AI generation costs per client project shall average $130-$150 total: onboarding $15, brand book $45, creatives (30 posts) $25, video (3 videos) $20, web (landing page) $20, email (5 templates) $5
- **NFR-4.3**: Service delivery shall require maximum 70 human hours for Tier 3 Full Design System ($35K tier) maintaining 70-74% gross margin: 45-55% work AI-automated initially (maturing to 55-65% after prompt calibration), 45-55% human review/refinement required initially. First 5 client projects are "pilot phase" with 50% time buffer over standard estimates
- **NFR-4.4**: Monthly retainer services ($2.5K/mo) shall be profitable at 15-35 human hours per month, supporting 6-8 retainer clients per copywriter with AI assistance vs 2-3 without
- **NFR-4.5**: Template system shall enable 90% asset reuse between clients requiring only token swap and content population, reducing design time from 40h to 14h for brand book per new client

**Security & Privacy**

- **NFR-5.1**: **[REVISED v1.2]** Client authentication for asset downloads shall use signed URLs with automatic expiration. ClickUp handles project access control via workspace permissions. Proprietary auth system deferred to Phase 2
- **NFR-5.2**: API keys for AI services (Claude, Flux, ElevenLabs) shall be stored encrypted in environment variables never exposed to client-side code
- **NFR-5.3**: Client assets shall be served via signed URLs with automatic expiration (15min for previews, 1h for downloads) preventing unauthorized access or hotlinking
- **NFR-5.4**: System shall be GDPR compliant with data deletion pipeline: client can request full data export (JSON + asset ZIP) and complete deletion (7-day soft delete, then permanent) with audit trail
- **NFR-5.5**: Uploaded client assets (logos, photos, documents) shall be scanned for malware using ClamAV or similar before storage acceptance
- **NFR-5.6**: Asset backups shall be encrypted at rest using AES-256, with automated daily snapshots retained for 30 days

**Observability & Monitoring**

- **NFR-6.1**: System shall log all AI API calls with: timestamp, client_id, agent type (copy/image/voice), input tokens, output tokens, cost, latency, success/failure status, enabling cost tracking per client and debugging
- **NFR-6.2**: Critical user journeys shall have instrumented monitoring: onboarding completion rate, time-to-first-asset, approval velocity, time-to-final-delivery, with alerts on anomalies (>2 standard deviations from mean)
- **NFR-6.3**: Error tracking shall capture errors with automatic issue grouping, source maps for stack traces, and alert thresholds (10 errors/hour triggers notification)
- **NFR-6.4**: Performance monitoring shall track Core Web Vitals (LCP, FID, CLS) for Brand Book sites and Landing Pages with targets: LCP <2.5s, FID <100ms, CLS <0.1
- **NFR-6.5**: **[REVISED v1.2]** Operational health tracked via ClickUp dashboards and simple monitoring: current active projects, average approval time, monthly costs, error rate past 24h

**Documentation & Knowledge Transfer**

- **NFR-7.1**: All service templates (Figma, AEP, MJML, HTML/CSS) shall be documented with README files explaining: purpose, customization points, token integration, export process, common pitfalls
- **NFR-7.2**: Technical architecture documentation shall include: system architecture diagram, asset organization structure, deployment options, token build pipeline, troubleshooting guide
- **NFR-7.3**: Each deliverable category shall have Quality Checklist (Brand Identity 7 items, Social Media 6 items, Web Design 8 items, Email 8 items, Motion 7 items, Ads 7 items) enforced before client delivery
- **NFR-7.4**: Client-facing documentation shall be generated automatically including: Brand Voice Guide PDF, Design Token specification JSON with examples, Component Library usage guide, Content Calendar instructions, SEO best practices checklist

**Security Hardening & Content Safety**

- **NFR-8.1**: All AI-generated content shall pass through automated content moderation filters checking for: offensive language (profanity filter + context-aware detection), factual claims (flag statements requiring source verification), brand-forbidden words (per client configuration from Brand Discovery Workshop vocabulary bank), competitor mentions (alert if competitor brand names appear), legal compliance (no unsubstantiated health/financial/legal claims). Content failing moderation shall be flagged for mandatory human review before client delivery
- **NFR-8.2**: **[REVISED v1.2]** Asset download rate limiting: signed URL generation limited to 100 per session per client. Abuse detection shall trigger manual review. Advanced rate limiting deferred to Phase 2 proprietary portal
- **NFR-8.3**: **[REVISED v1.2]** Webhook endpoints (when CMS is used) shall validate HMAC signatures using per-endpoint shared secrets. Unsigned or invalid webhook payloads shall be rejected with HTTP 401. For static-only deployments, no webhooks required
- **NFR-8.4**: **[REVISED v1.2]** Data isolation via R2 folder structure and ClickUp permissions. Supabase RLS testing deferred to Phase 2 when database-backed multi-tenancy is implemented

**[NEW v1.2] Static Delivery & Portability**

- **NFR-9.1**: Brand Book local package shall be fully functional when opened via index.html in any modern browser without requiring local server, Node.js, or any runtime dependencies
- **NFR-9.2**: All static deliverables shall use relative paths for assets (CSS, JS, images, fonts) ensuring portability across different hosting locations and local file system access
- **NFR-9.3**: Static sites shall be deployable to any hosting platform: Vercel, Netlify, GitHub Pages, AWS S3, any Apache/Nginx server, or simple file hosting without configuration changes
- **NFR-9.4**: Brand Book local package shall include: index.html, all HTML pages, /assets folder (CSS, JS, fonts, images), embedded or linked design tokens, and maintain full navigation and search functionality offline
- **NFR-9.5**: Landing Pages and Institutional Sites when delivered as static packages shall follow same portability requirements: relative paths, no server dependencies, single ZIP deployable anywhere

**[NEW v1.2] Audit & Inference Quality**

- **NFR-9.6**: Digital presence audit shall tolerate incomplete, inconsistent, or outdated source content: graceful degradation when URLs are inaccessible, clear confidence indicators for inferences, explicit flagging of data quality issues
- **NFR-9.7**: All AI-generated audit inferences shall be labeled as drafts requiring validation. No automated inference shall become official brand direction without human review checkpoint
- **NFR-9.8**: Audit report shall indicate confidence levels (High/Medium/Low) for each inference based on: source data availability, consistency across sources, recency of content analyzed
- **NFR-9.9**: System shall handle platform access limitations gracefully: public-only access to social platforms, rate limiting from scraped sites, blocked or private accounts

**[NEW v1.2] Validation Program Operations**

- **NFR-9.10**: MVP operations shall function fully without proprietary Client Portal, using ClickUp for all project management, approvals, and communication
- **NFR-9.11**: Reference projects in validation program shall use identical tooling, workflows, and deliverable formats as planned for real clients - no simplified parallel tracks
- **NFR-9.12**: Validation learnings shall be captured in structured format enabling systematic backlog updates, prompt refinements, and documentation improvements
- **NFR-9.13**: Transition from validation to commercial operation shall require no architectural changes - same infrastructure, same workflows, same deliverable formats

---

## Service Tiers & Pricing

### Tier 1: Brand Book ($8,000 / R$40,000)
**Timeline:** 2-3 weeks | **Target:** Startups, Solo Entrepreneurs

**Deliverables:**
- Brand Discovery (abbreviated 2h workshop/questionnaire)
- **[NEW v1.2]** Optional: Digital Presence Audit (if existing presence available)
- Logo System (primary, secondary, monogram, favicon)
- Color Palette (primary + secondary, 30+ tokens)
- Typography Selection (2 font families, hierarchy)
- Brand Voice Guide (8-12 pages)
- Manifesto + Value Proposition (1 page each)
- Taglines (5-10 options + rationale)
- **[REVISED v1.2]** Brand Book: online version + PDF (20-30 pages) + local package (index.html)
- Social Media Templates (5 feed + 5 stories)
- Email Signature (HTML)
- Bio Link Page (Linktree-style)
- Brand Asset Package (ZIP with all logos, colors JSON, fonts)

**Human Time:** 50-55h (pilot), 40h (steady-state) | **Margin:** 63-66% (pilot), 73% (steady-state)

### Tier 2: Brand System ($18,000 / R$90,000)
**Timeline:** 4-6 weeks | **Target:** Scale-ups, Funded Startups

**Includes Tier 1 plus:**
- Full Brand Strategy Workshop (personality, competitors, positioning)
- **[NEW v1.2]** Digital Presence Audit with improvement recommendations
- Extended Visual Identity (icon set 40+, patterns, photography direction)
- **[REVISED v1.2]** Interactive Brand Book (web-based, static HTML/CSS/JS or optional subdomain)
- Design Tokens (primitive + semantic, CSS/SCSS/Tailwind/JSON exports)
- **[REVISED v1.2]** Landing Page (conversion-focused, copy + design + static HTML build)
- **[REVISED v1.2]** Institutional Website (5-7 pages, static HTML or optional CMS)
- Pitch Deck Template (15-25 slides, editable masters)
- GA4 + GTM + Search Console setup
- Basic SEO (meta tags, sitemap, robots.txt, on-page optimization)
- Website Training (static updates or CMS when applicable)

**Human Time:** 95-110h (pilot), 80h (steady-state) | **Margin:** 68-71% (pilot), 76% (steady-state)

### Tier 3: Full Digital Presence ($35,000 / R$175,000)
**Timeline:** 6-10 weeks | **Target:** Series A/B Companies, Established Businesses

**Includes Tier 2 plus:**
- Figma Component Library (60+ components, 200-400 variants)
- Tailwind/CSS Theme Package (full token integration)
- **[REVISED v1.2]** Extended Institutional Website (10+ pages, blog setup, static or CMS)
- Email Marketing Setup (platform integration, 3 templates, welcome sequence 5 emails)
- Ad Creative Starter Pack (Meta 10-15 creatives + Google Display 10 sizes)
- Pixel/Tracking Setup (Meta Pixel, Google Ads conversion, UTM strategy)
- Corporate Materials (proposal template, case study template, one-pager)
- Social Media Strategy (content pillars, calendar template, first month 20 posts)
- WhatsApp Business Setup (business account, greeting, quick replies)
- Brand Usage Training (1-2h session + recorded video)

**Human Time:** 175-200h (pilot), 150h (steady-state) | **Margin:** 70-74% (pilot), 77% (steady-state)

### Retainer Add-on ($2,500/month / R$12,500/month)
**Ongoing Content & Maintenance**

**Monthly Deliverables:**
- 12-16 Social Media Posts (copy only)
- 4-8 Carousels (design + copy)
- 4-8 Emails (newsletters, promotional)
- 4 Blog Posts (SEO-optimized, 2000 words each)
- 15-30 Ad Copy Variations (A/B testing)
- Content Calendar (monthly plan)
- Website Maintenance (updates, content changes)
- Quarterly Brand Consistency Audit (visual + messaging)
- Monthly Analytics Report (GA4, social performance, recommendations)
- Design Support (bucket of 10h/month for ad-hoc requests)

**Human Time:** 15-25h/month | **Margin:** 60-80%

---

## Technical Architecture Summary

### Core Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | **[REVISED v1.2]** Static HTML/CSS/JS (default) or Next.js (optional) | Static-first for portability and simplicity; Next.js when SSR/CMS needed |
| **CMS** | **[REVISED v1.2]** Payload CMS 3.x (OPTIONAL) | Self-hosted in Next.js when client needs frequent content updates; not required for MVP |
| **Operations** | **[NEW v1.2]** ClickUp | Project management, client communication, approvals, revisions, retainer ops |
| **Asset Storage** | Cloudflare R2 | S3-compatible, zero egress fees, global CDN, ~$0.015/GB/month |
| **Hosting** | **[REVISED v1.2]** Any static host (Vercel, Netlify, etc.) | Flexibility; Vercel Pro for Next.js sites when needed |
| **Design Tool** | Figma Professional | Component library, design tokens (Variables), Dev Mode, $12-15/seat/month |
| **Design Tokens** | W3C DTCG Format + Style Dictionary | Industry standard (2025.10 stable), tool-agnostic, multi-platform output |
| **Creative Rendering** | Satori (server-side) + Sharp | JSX-to-SVG then rasterization, no browser overhead, 60-70% faster than Puppeteer |
| **Email** | MJML (design) + Resend API (delivery) | React-like email components, 100/day free tier, $20/mo for 50K sends |
| **Video** | Remotion 4.x | React-based video, same component library as brand book, Company license $100/mo |
| **Video Rendering** | Remotion Lambda | Serverless AWS rendering, ~$0.01-0.05 per render |
| **Motion Export** | After Effects (legacy) + Lottie | AEP for complex work, Lottie JSON for web, GIF fallback |

### AI Acceleration Layer

| Function | AI Service | Cost per Client Project |
|----------|-----------|------------------------|
| **Text Generation** | Claude API (Anthropic) + GPT-4o (OpenAI) | ~$80 (copy across all deliverables) |
| **Image Generation** | Flux 1.1 Pro (Replicate) + DALL-E 3 (OpenAI) | ~$20-30 (backgrounds, hero images, moodboards) |
| **Voice Synthesis** | ElevenLabs Scale Plan | ~$15-20 (video voiceovers, 3 videos avg) |
| **Music/SFX** | Licensed library or Mubert API | ~$5-10 (background music for videos) |
| **Total AI Cost/Client** | | ~$130-150 |

### [REVISED v1.2] Infrastructure Costs (10 Active Clients/Month) - MVP Simplified

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Static Hosting | Vercel/Netlify Free-Pro tiers | $0-40 |
| Cloudflare R2 | Pay-as-go (~50GB storage, 500GB transfer) | $8 |
| ClickUp | Business ($12/user x 3) | $36 |
| Remotion | Company License | $100 |
| ElevenLabs | Scale ($99/mo, 100K chars) | $99 |
| Resend | Pro ($20/mo, 50K emails) | $20 |
| Replicate (Flux) | Pay-per-use (~500 images/mo) | $20 |
| OpenAI (DALL-E + GPT) | Pay-per-use | $50 |
| Anthropic (Claude) | Pay-per-use | $80 |
| Figma | Professional (2 seats) | $30 |
| Tokens Studio (Figma Plugin) | Pro | $12 |
| Sentry (Error Tracking) | Free tier | $0 |
| **Total Infrastructure** | | **$455-495/month** |

At 10 clients/month = ~$45-50/client infrastructure overhead (reduced from $52)
At 50 clients/month = ~$9-10/client infrastructure overhead

### [REVISED v1.2] Deployment Architecture - Static First

```
BRAND BOOK DELIVERY
    ↓
[Static Build] (HTML + CSS + JS + assets)
    ↓
[Three Delivery Formats]
    ├── Online: Deploy to Vercel/Netlify/any host
    ├── PDF: Generate via Puppeteer/wkhtmltopdf
    └── Local Package: ZIP with index.html + assets/

CLIENT ACCESS
    ├── Online URL (e.g., acme-brand.vercel.app)
    ├── PDF download via R2 signed URL
    └── ZIP download via R2 signed URL
```

**Simplified Multi-Tenancy:** Each client gets their own static deployment (separate URL) rather than subdomain routing with runtime token injection. This eliminates middleware complexity while maintaining full brand customization via build-time token injection.

---

## AI Acceleration Strategy

### Copy Production

**Automation Level:** 50-65% time reduction (initial), maturing to 60-75% after prompt calibration
**Human Touchpoints:** Quality review, brand voice calibration, final approval, prompt quality scoring (FR-9.2)

| Deliverable | Manual Time | AI-Assisted Time | Method |
|-------------|------------|------------------|--------|
| Brand Voice Guide | 16-24h | 8-12h (50%) | AI draft from questionnaire → human refine |
| Instagram Post | 30-45min | 10-15min (67%) | Claude API generates HCEA framework → human review |
| Carousel (10 slides) | 60-90min | 20-30min (67%) | Claude generates structured content → human layout |
| Blog Post (2000 words) | 4-6h | 1.5-2h (63%) | Claude draft with SEO → human edit + fact-check |
| Email Sequence (5) | 4-6h | 1.5-2h (67%) | Claude generates series → human tone adjust |
| Landing Page Copy | 8-12h | 3-4h (63%) | Claude section-by-section → human optimize CTA |
| Ad Copy (10 variations) | 3-4h | 45min-1h (78%) | Claude angle matrix → human select best 3 |

**Quality Gates:**
- Every AI-generated copy reviewed by human for: brand voice consistency, grammar, factual accuracy, tone appropriateness, CTA clarity, no forbidden words
- All AI-generated content passes automated content moderation filters (NFR-8.1) before human review
- No AI output goes directly to client without human QA pass
- Copy longer than 500 words requires senior copywriter review
- Prompt quality scoring (FR-9.2) tracks acceptance rates per prompt version

### Visual Production

**Automation Level:** 35-50% time reduction (initial), maturing to 40-60% after template refinement
**Human Touchpoints:** Concept direction, layout decisions, final polish, accessibility validation

| Deliverable | Manual Time | AI-Assisted Time | Method |
|-------------|------------|------------------|--------|
| Moodboard | 4h | 0.5h (87%) | Midjourney generates 8-12 references → human curate |
| Color Palette | 4h | 1h (75%) | AI suggests harmonies + contrast ratios → human validate WCAG |
| Social Post Template | 1h | 30-40min (40%) | AI generates hero image → human designs layout in Figma |
| Thumbnail YouTube | 30-45min | 20-30min (33%) | AI background → human adds text + face composite |
| Icon (single) | 20-30min | 15-20min (30%) | AI concept sketch → human vector trace in Illustrator |

**Quality Gates:**
- All AI-generated images inspected for: artifacts (malformed hands/text), brand color alignment, resolution sufficiency, appropriate licensing
- Logos and brand marks NEVER generated by AI (legal/copyright issues)
- Final design reviewed for: accessibility (contrast), responsiveness (3 breakpoints), platform specs (dimensions, file size)

### Technical Implementation

**Automation Level:** 45-60% time reduction (initial), maturing to 50-70% after pipeline maturity
**Human Touchpoints:** Architecture decisions, custom feature code, testing, deployment verification

| Task | Manual Time | AI-Assisted Time | Method |
|------|------------|------------------|--------|
| Token File Generation | 4-6h | 1-2h (70%) | Script transforms Figma Variables → W3C DTCG → Style Dictionary → CSS/SCSS/Tailwind |
| Component Code Export | 8-16h | 4-8h (50%) | Figma plugin exports React baseline → human refine props/logic |
| Landing Page Build | 12-20h | 6-10h (50%) | Design → HTML/CSS via Figma-to-Code → human add interactions/forms |
| SEO Meta Tags | 2-3h | 30-45min (70%) | Claude generates title/description per page → human validate keywords |
| Email HTML | 4-6h | 1.5-2h (67%) | MJML components → AI populates content → human test across clients |

**Quality Gates:**
- All code reviewed for: correctness, WCAG AA compliance, mobile responsiveness, cross-browser compatibility (Chrome, Safari, Firefox, Edge)
- Lighthouse audit must score: Performance >90, Accessibility >95, Best Practices >90, SEO >95
- Manual QA on real devices: iPhone (Safari), Android (Chrome), iPad, Desktop (1920px, 1440px, 1024px)

---

## Success Metrics & KPIs

### Business Metrics (Year 1 Targets)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Monthly Recurring Revenue (MRR)** | $25K by Month 12 | 10 retainer clients @ $2.5K each |
| **New Client Acquisition** | 3-5 clients/month average | Tier 1-3 projects closed |
| **Average Deal Size** | $18K | Mix of Tier 1 ($8K), Tier 2 ($18K), Tier 3 ($35K) |
| **Gross Margin** | 63-74% (pilot), 70-77% (steady-state) | (Revenue - COGS) / Revenue |
| **Client Lifetime Value (LTV)** | $45K | Initial project $18K avg + 12 months retainer $30K |
| **Customer Acquisition Cost (CAC)** | <$2K | Marketing + sales cost per client |
| **LTV:CAC Ratio** | >20:1 | Healthy SaaS metric |
| **Delivery Time** | 3-4 weeks avg | From contract to final delivery |
| **Revision Rounds** | <2 avg | Included revisions used |

### Operational Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to First Asset** | <48h from approval | Onboarding → first brand direction presentation |
| **Asset Generation Speed** | 30 posts in 10min | Batch creative pipeline |
| **Brand Book Deploy Time** | <5min | Static upload or Git push |
| **AI Cost per Client** | <$150 | Total AI API spend per project |
| **Infrastructure Cost per Client** | <$15/month active | Hosting + storage + services (reduced with static-first) |
| **Human Hours per Tier 3** | <70h | AI-assisted production time |
| **Approval Velocity** | <3 days avg | Time from submission to client approval |
| **Support Ticket Resolution** | <24h for P1, <3 days P2 | Client issue response time |

### Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Client Satisfaction (NPS)** | >50 | Net Promoter Score survey post-delivery |
| **Asset Acceptance Rate** | >85% first submission | Deliverables approved without revision |
| **WCAG AA Compliance** | 100% | All web deliverables pass automated + manual audit |
| **Accessibility Score (Lighthouse)** | >95 | Automated testing on all landing pages/sites |
| **Performance Score (Lighthouse)** | >90 | Page load speed, Core Web Vitals |
| **Defect Rate** | <5% | Assets requiring fix after approval |
| **Brand Voice Consistency** | >90% | QA checklist pass rate |

### Customer Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Onboarding Completion Rate** | >95% | Clients completing full questionnaire |
| **Asset Download Rate** | >80% | Clients downloading delivered assets within 30 days |
| **Website Update Rate** | >60% | **[REVISED v1.2]** Clients updating content post-training (static or CMS) |
| **Retainer Conversion Rate** | >40% | Tier 2/3 clients adding monthly retainer |
| **Referral Rate** | >25% | Clients referring new business |
| **Renewal Rate** | >85% | Retainer clients renewing after 12 months |

### [NEW v1.2] Validation Program Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Reference Projects Completed** | 3-5 before commercial launch | Full workflow validation |
| **Learnings Captured per Project** | 5-15 items | Gaps, improvements, refinements |
| **MVP-Blocking Issues Found** | 0 by launch | Critical issues resolved during validation |
| **Prompt Refinement Cycles** | 2-3 per prompt template | Quality score improvement |
| **Workflow Friction Points** | <3 major by launch | Operational smoothness |

---

## Constraints (CON)

- **CON-1**: Service launch constrained to 3 core pillars (Brand Identity, Creativos, Landing Pages/Sites) in MVP; remaining 4 pillars (Email, Ads, Video, Corporate Materials) deferred to Phase 2 post-validation
- **CON-2**: **[REVISED v1.2]** Initial infrastructure uses simplified architecture (per-client static hosting, ClickUp operations); advanced multi-tenant architecture deferred to Phase 2
- **CON-3**: AI generation quality dependent on third-party API uptime and model availability (Claude API, Flux, DALL-E); degraded service if provider downtime exceeds 1 hour
- **CON-4**: Design System components limited to web/digital use cases; native mobile app UI kits (iOS/Android) out of scope for MVP
- **CON-5**: Video production limited to template-based motion graphics and 2D animation via Remotion/After Effects; complex 3D animation or live-action video editing requires external vendor partnership
- **CON-6**: Multi-language support (i18n) not included in MVP; all deliverables produced in client's primary language only (pt-BR or en-US)
- **CON-7**: Print production coordination (physical printing of stationery, business cards, brochures) is out of scope; service delivers print-ready files only (PDF with bleed/crop marks, CMYK color space)
- **CON-8**: Custom illustration or photography (beyond AI generation and stock curation) requires additional budget and timeline; MVP uses AI-generated imagery and licensed stock only
- **CON-9**: Accessibility compliance targets WCAG AA minimum; WCAG AAA or specialized accessibility audits (screen reader testing, cognitive disability accommodations) require separate engagement
- **CON-10**: Legal review of contracts, terms of service, privacy policies, or other legal documents is client's responsibility; service provides templates only, not legal advice
- **CON-11**: Integration with client's existing systems (CRM, ERP, marketing automation beyond email ESP) requires custom development outside standard service scope
- **CON-12**: Technical support limited to business hours (Mon-Fri 9am-6pm client timezone); no 24/7 on-call support in standard tiers
- **CON-13**: Design token source of truth is the W3C DTCG JSON files in code, not Figma. Figma is a consumer of tokens (Code pushes to Figma via Tokens Studio), never a producer. Bidirectional sync between Figma and code is explicitly prohibited in production to prevent token conflicts and state divergence
- **CON-14**: Revision rounds are counted per deliverable type (e.g., 3 rounds for brand identity, 3 rounds for social creatives), not per individual deliverable. For Tier 3 projects with 50+ individual deliverables, per-deliverable revision tracking would be operationally unsustainable
- **CON-15**: Logos and brand marks are NEVER generated by AI. All logo design, logomark creation, and brand mark development require human designer work. AI may assist with concept exploration (moodboards, style references) but final logo assets must be human-created due to legal/copyright concerns with AI-generated trademarks and the requirement for trademark registrability

**[NEW v1.2] MVP Simplification Constraints**

- **CON-16**: MVP prioritizes operational simplicity and static deliverables; proprietary Client Portal, CMS integration, and advanced multi-tenant infrastructure are NOT required in MVP and are deferred to Phase 2
- **CON-17**: Client's existing digital presence may be incomplete, inconsistent, or outdated; automated audit is strategic support, not replacement for discovery workshop
- **CON-18**: Automated audit can only analyze publicly accessible content or content explicitly authorized by client; private accounts, authenticated pages, and restricted content are out of scope
- **CON-19**: Reference projects in validation program must use identical infrastructure and workflows as planned for commercial clients; no simplified parallel tracks allowed
- **CON-20**: Validation program exists to reduce risk before commercial operation; it is not a permanent parallel workflow
- **CON-21**: ClickUp is the operational hub for MVP; alternatives or proprietary systems require separate evaluation and are not in MVP scope
- **CON-22**: Brand Book local package must function via index.html without any server; features requiring server-side processing are excluded from local package

---

## Risks & Mitigations

### High-Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **AI generates off-brand content** | High (70%) | Medium | Mandatory human QA gate on all AI outputs; brand guardrails in prompts; example bank per client; senior copywriter spot-checks first 5 deliverables per new client |
| **Client dissatisfaction with AI-generated visuals** | Medium (40%) | High | 3 revision rounds included in pricing; human designer always refines AI output; set expectations in sales process that AI accelerates but doesn't replace human creativity; show examples of final output quality |
| **Underestimated human review time** | Medium (50%) | Medium | Track actual hours per deliverable category for first 10 clients; adjust pricing or processes if margins compress below 65%; build 20% buffer into timeline estimates |
| **AI API cost overruns** | Low (20%) | Medium | Set hard spending limits per client project ($200 cap); monitor costs weekly; negotiate volume discounts with providers (Anthropic, Replicate) after 50 clients; optimize prompts to reduce token usage |
| **Prompt engineering dependency on automation promise** | High (70%) | High | The 45-55% automation target depends entirely on well-calibrated prompts (FR-9.1-9.3). Without a formal prompt engineering pipeline, automation rates could drop to 25-35%. First 5 clients are pilot phase with dedicated prompt calibration effort and 50% time buffer |

### Medium-Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Scalability bottleneck at 50+ clients** | Medium (40%) | Medium | Architect for Phase 2 capacity; monitor project volume; implement advanced multi-tenancy when approaching 40 clients |
| **Template system rigidity limits customization** | Medium (45%) | Medium | Offer "Custom" tier above Tier 3 for fully bespoke work at premium pricing; document extensibility points in templates; build 20% custom work capacity into resource planning |
| **Design token standard evolves breaking compatibility** | Low (25%) | Low | Use Style Dictionary abstraction layer to isolate from W3C spec changes; monitor DTCG working group updates; plan migration path if spec changes significantly |
| **Key AI provider changes pricing/terms** | Medium (35%) | Medium | Multi-provider strategy (Claude + GPT-4 for copy, Flux + DALL-E for images); evaluate self-hosted LLM options (Llama 3) if costs triple |
| **Client expects unlimited revisions** | High (60%) | Low | Clearly state "3 revision rounds included" in contract; charge $500/round thereafter; define what constitutes a "round" (all feedback batched, max 1 round per 5 business days) |

### Technical Infrastructure Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Claude API rate limits break batch timing** | Medium (50%) | Medium | Claude API Tier 2 allows ~40 RPM. The "8 min for 30 posts" estimate (FR-2.7) assumes full parallelism that rate limits may prevent. Implement queue management with backpressure, throttle to stay within RPM limits, and adjust timing estimates to 12-15 minutes if throttled. Negotiate higher tier with Anthropic after 20+ clients |
| **Figma token sync direction conflict** | High (60%) | Medium | Clients may expect to edit tokens in Figma and see brand book update automatically. Token flow MUST be unidirectional: Code (W3C DTCG JSON) -> Figma (via Tokens Studio push). See CON-13. Set expectations during onboarding that Figma is a consumer, not producer of tokens |

### [NEW v1.2] Audit & Validation Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Outdated/poor content biases audit diagnosis** | High (65%) | Medium | Clearly label all audit findings as "based on current public content"; include confidence levels; recommend discovery workshop areas to validate/override AI inferences; mandatory human review before client presentation |
| **Partial access to social platforms** | Medium (50%) | Low | Use public-only scraping; document limitations in audit report; flag when private/authenticated content would provide better insights; offer manual review option |
| **Conflict between current signals and desired positioning** | High (60%) | Medium | Explicitly highlight gaps between "what we found" and likely "where you want to go"; use audit as starting point for positioning discussion, not final direction |
| **ClickUp-centric operations hit scaling limits** | Medium (40%) | Medium | Monitor operational friction as client count grows; document transition path to proprietary portal; evaluate ClickUp Enterprise or alternatives at 30+ active clients |
| **Future CMS need for high-update clients** | Medium (45%) | Low | Static-first doesn't preclude CMS; offer CMS add-on for clients with >4 content updates/month; document migration path from static to CMS-enabled site |
| **Reference projects don't represent real client variability** | Medium (50%) | High | Include diverse profiles in validation: new brand, rebrand, strong digital presence, weak presence, no presence; simulate difficult client scenarios (delayed feedback, scope changes, revision loops) |
| **Validation uncovers too many improvements causing scope creep** | High (60%) | Medium | Classify all learnings: (A) MVP-blocking - must fix, (B) Post-MVP backlog - defer, (C) Client-specific - don't productize; strict governance on what enters MVP scope vs backlog |

### Low-Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Figma changes component export API** | Low (15%) | Low | Monitor Figma developer changelog; maintain fallback manual export workflow; document workarounds |
| **Remotion rendering cost increases** | Low (20%) | Low | Self-host render farm at scale using Railway workers; benchmark costs at 20 clients and decide on self-hosting |
| **Email deliverability issues** | Low (15%) | Medium | Use reputable ESP (Resend); implement SPF, DKIM, DMARC for client domains; monitor bounce/spam rates; warm up sending domains gradually |
| **GDPR/privacy regulation compliance** | Low (10%) | High | Build GDPR compliance from start (data export, deletion, audit trail); annual legal review; privacy policy reviewed by attorney |

---

## Future Expansion Roadmap (Post-MVP)

### Phase 2: Service Expansion (Months 6-12)

**Infrastructure Upgrades (Post-Validation)**
- Proprietary Client Portal (replacing ClickUp for client-facing operations)
- Multi-tenant architecture with subdomain routing
- Supabase RLS-based data isolation
- Advanced analytics dashboard

**Pillar 4: Email Marketing** (Q3)
- Full email template suite (newsletter, promotional, transactional)
- Welcome sequence automation (5-7 emails)
- Lead nurture drip campaigns
- A/B testing infrastructure for subject lines
- ESP integration: Resend (primary), Brevo/Mailchimp (alternatives)
- **Estimated addition to Tier 3:** +$5K, +2 weeks timeline

**Pillar 5: Ads Criativos** (Q3)
- Meta Ads creative generation (10-15 variations per campaign)
- Google Display Ads (all IAB sizes + Responsive Display)
- Google Search Ads copy (Responsive Search Ads)
- LinkedIn Ads
- YouTube Ads (video creative production)
- Pixel/tracking setup and documentation
- **Estimated addition to Tier 3:** +$7K, +2 weeks timeline

**Pillar 6: Video & Motion Graphics** (Q4)
- Logo animation (2D/3D)
- Video intro/outro for YouTube
- Social media motion templates (Stories, Reels)
- Lower thirds & overlays
- Custom transitions
- Explainer video production (60-90s)
- **Estimated addition to Tier 3:** +$8K, +3 weeks timeline

### Phase 3: Advanced Features (Months 12-18)

**Pillar 7: Materiais Corporativos** (Q1 Year 2)
- Pitch deck template (investor-ready)
- Commercial proposal template
- Stationery suite (letterhead, envelope, folder, business cards)
- Case study template
- Institutional presentation (distinct from pitch deck)
- One-pager/executive summary
- **Estimated addition to Tier 3:** +$4K, +1 week timeline

**Advanced Design System Features:**
- Coded component library (React npm package)
- Storybook interactive playground
- Design-to-code sync automation (Figma Variables → GitHub Actions → deploy)
- Multi-theme support (light/dark/high-contrast)
- Accessibility audit with WCAG AAA compliance
- Component maturity indicators (Alpha/Beta/Stable)
- **Estimated addition to Tier 3:** +$15K, +4 weeks timeline

**E-commerce Specialized Offering:**
- Full e-commerce design system
- Product page templates (PDP)
- Listing page templates (PLP)
- Cart and checkout flow design
- Shopify/WooCommerce theme integration
- Product photography guidelines and editing
- **New Tier 4:** $50K-75K, 10-12 weeks

### Phase 4: Platform & Automation (Months 18-24)

**Self-Service Platform MVP:**
- Guided questionnaire with real-time preview
- Automated token generation and theme preview
- Template selection (choose from 5-10 pre-built styles)
- DIY asset download without human review
- Lower price point: $2K-5K for automated tier
- Target: 10x client volume, 10% margins, fully automated

**White-Label Program:**
- Allow agencies to resell service under their brand
- API access to generation pipeline
- Custom subdomain per agency (agency.brand.theircompany.com)
- Revenue share: 70/30 split
- Target: 20-30 agency partners by end of Year 2

**AI Agent Specialization:**
- Train custom fine-tuned models on successful brand books
- Client-specific AI agents (retain brand voice across projects)
- Automated quality scoring (predict if output will pass human QA)
- Reduce human QA time from 30% to 15% of process

---

## Next Steps

### [REVISED v1.2] Immediate: Internal Validation Program

**Objective:** Validate MVP with 3-5 reference projects before commercial launch

**Reference Project Profiles:**
1. New brand (startup, no existing presence)
2. Rebrand (existing company, legacy assets)
3. Strong digital presence (cleanup and systematization)
4. Weak digital presence (significant gaps to fill)
5. Tier 3 simulation (full scope, all deliverables)

**Per-Project Deliverables:**
- Full workflow execution (onboarding → delivery)
- Brand Book in all 3 formats (online + PDF + local package)
- Landing Page (static HTML/CSS/JS)
- Validation Learnings Document

**Success Criteria:**
- All 3 delivery formats functional
- ClickUp workflow operational
- QA checklists validated
- Prompt templates refined
- No MVP-blocking issues remaining

### For UX Expert (@ux-design-expert / Uma)

**Prompt:**

Uma, please review this PRD v1.2 and create detailed UX specifications for the static Brand Book site and Landing Page templates. Focus on:

1. **Brand Book Static Site** - Design the navigation structure, section layouts, and component showcase pages that work both online and as a local package (opened via index.html). Include client-side search (Fuse.js), responsive design, and offline-friendly architecture.

2. **Landing Page Templates** - Create 3-5 conversion-focused templates in static HTML/CSS/JS that clients can customize. Include clear customization points for tokens, content, and imagery.

3. **Responsive Breakpoints** - Define the mobile-first experience for all screens ensuring compliance with NFR-3.2 (320px-1920px, 44x44px touch targets).

4. **Accessibility** - Specify WCAG AA compliance requirements per NFR-2.1 with focus on keyboard navigation, screen reader support, and color contrast validation.

Deliverables: Figma wireframes (low + high fidelity), HTML/CSS templates, interaction specifications, responsive behavior documentation. Timeline: 1 week.

---

### For Architect (@architect / Aria)

**Prompt:**

Aria, please review this PRD v1.2 and design the simplified technical architecture for the Brand System Service MVP. Focus on:

1. **Static-First Architecture** - Design the build pipeline for Brand Book, Landing Pages, and Sites as static HTML/CSS/JS. Include token injection at build time, asset bundling, and multi-format output (online deploy, PDF, local package).

2. **AI Acceleration Pipeline** - Design the orchestration layer for AI services (Claude, Flux, DALL-E, ElevenLabs) including: job queue management, cost tracking, retry logic, fallback providers, rate limiting. Reference AI Acceleration Strategy section.

3. **Asset Management** - Design the Cloudflare R2 folder structure, signed URL generation, and delivery workflow for all client assets.

4. **ClickUp Integration** - Document the operational workflow using ClickUp for project management, approvals, and client communication.

5. **Phase 2 Migration Path** - Outline the upgrade path from static-first MVP to multi-tenant architecture with proprietary portal when scaling beyond 40 clients.

Deliverables: System architecture diagram (C4 model), build pipeline diagram, asset organization structure, ClickUp workflow documentation, Phase 2 migration plan. Timeline: 1.5 weeks.

---

**END OF PRD v1.2**

