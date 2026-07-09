# Architecture — Wave E (Constitution stretch)

| Campo | Valor |
|-------|-------|
| Wave | E |
| Epic | CORE-SUPER-UPDATE |
| Status | Accepted — E1 ✅ (XI+XII shipped, covers old E2) · E3 optional backlog · E4 DEFERRED |
| Depends | Numbering decision locked in epic (hub XI/XII) |

## 1. Goal

Port **Squad-First Portability (XI)** and **Model Governance (XII)** text into OSS constitution as optional/MUST per epic — **without** Workspace Bus / tribunal / product services.

## 2. Numbering (locked)

| Article | Source | OSS |
|---------|--------|-----|
| I–VI | current OSS | keep |
| **XI** | Hub Squad-First | port |
| **XII** | Hub Model Governance | port; strip enterprise services |
| VII–X, XIII | hub multi-BU | doc-only optional, not MUST runtime |

Enterprise nuance: enterprise has I–XII, with XII as Workspace Bus. Hub has I–XIII, with XII as Model Governance and XIII as Workspace Bus. OSS follows hub XI/XII only; enterprise XII is explicitly out of scope.

## 3. Stories

| ID | Scope | Status |
|----|--------|--------|
| E1 | Articles XI **and** XII in `.aiox-core/constitution.md` (v1.1.0) | ✅ Done |
| E2 | Draft XII Model Governance | ✅ Merged into E1 |
| E3 | Docs cross-links only | ⬜ Optional backlog |
| E4 | governance-pipeline skill | 🚫 DEFERRED |

## 4. Explicitly non-ported

- Workspace Bus as Article XII (enterprise numbering)
- Policy digests / multi-BU hard gates runtime
- Model tribunal service harness
- Enterprise constitution numbering as the OSS numbering source

## 5. Acceptance ARCH-E

- [x] This document
- [x] E1 constitution XI+XII (OSS-safe)
- [x] No workspace bus as MUST in OSS constitution
