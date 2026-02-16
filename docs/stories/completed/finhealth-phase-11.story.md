# FinHealth Squad — Phase 11: Assinatura XML com Certificado Digital A1 (H6)

> Implementar assinatura XMLDSig (enveloped) para TISS XML usando xml-crypto, com gerenciamento de certificados ICP-Brasil A1 (.pfx/.p12).

**Status:** Done
**Data:** 2026-02-16
**Baseline:** 604 testes squad (Phase 10 inclusa)
**Final:** 628 testes (+24 novos)

---

## Escopo

Certificados digitais ICP-Brasil tipo A1 sao obrigatorios para envio de guias TISS para operadoras de saude. Esta fase implementa:

1. **Certificate Manager** — parsing de .pfx/.p12, extracao de metadados (CN, CNPJ/CPF, validade, issuer), validacao de expiracaoo
2. **XML Signer** — assinatura XMLDSig enveloped (C14N + RSA-SHA256 + SHA-256 digest)
3. **Verification** — verificacao de assinaturas e deteccao de adulteracao

---

## Decisoes Tecnicas

| Decisao | Escolha | Justificativa |
|---------|---------|---------------|
| Lib assinatura | xml-crypto | Unica lib XMLDSig madura no Node.js, suporte a C14N e enveloped |
| PFX parsing | Node.js crypto nativo | Sem dependencia extra para PKCS12. X509Certificate para metadados |
| Canonicalizacao | xml-exc-c14n# | Padrao ANS TISS (Exclusive XML Canonicalization) |
| Algoritmo assinatura | RSA-SHA256 | Exigido pelo padrao TISS v4.01.00 |
| Algoritmo digest | SHA-256 | Exigido pelo padrao TISS |
| Frontend | Nao necessario | Upload de certificado ja existe (Epic 3 frontend) |

---

## Deliverables

### 11.1 Crypto Types (`src/crypto/types.ts`)

```typescript
CertificateInfo     // CN, serial, issuer, subject, validFrom/To, CNPJ, CPF, fingerprint
CertificateValidation  // valid, expired, daysUntilExpiry, errors[], warnings[], info
SigningResult       // signedXml, signatureValue, certificateInfo, signedAt
VerificationResult  // valid, errors[]
```

### 11.2 Certificate Manager (`src/crypto/certificate-manager.ts`)

- `parsePfx(buffer, passphrase)` — extrai private key + certificate PEM + metadata de .pfx/.p12
- `validate(info)` — valida expiracaoo, alerta <30 dias, detecta not-yet-valid
- `validatePfx(buffer, passphrase)` — parse + validate combinados
- `createInfo(fields)` — construtor manual para testes
- Extraccao automatica de CNPJ/CPF do subject ICP-Brasil via regex

### 11.3 XML Signer (`src/crypto/xml-signer.ts`)

- `sign(xml, privateKey, certificate, info)` — XMLDSig enveloped com prefix `ds:`
  - Transform: enveloped-signature + C14N
  - Namespace ANS preservado: `ans: http://www.ans.gov.br/padroes/tiss/schemas`
- `verify(signedXml, certificate)` — verificacao completa com deteccao de adulteraccao
- `generateTestCertificate(cn)` — RSA 2048-bit keypair para testes (NAO usar em producao)

### 11.4 Testes (24 testes)

**certificate-manager.test.ts (10 testes):**
- createInfo: gera fingerprint, aceita custom, preserva CNPJ
- validate: valido, expirado, not-yet-valid, warning <30 dias, CN vazio, daysUntilExpiry=0

**xml-signer.test.ts (14 testes):**
- generateTestCertificate: gera keypair, custom CN
- sign: XML simples, TISS XML, RSA-SHA256, C14N, enveloped transform, assinaturas diferentes por conteudo, assinaturas diferentes por chave
- verify: XML correto, conteudo adulterado, certificado errado, sem assinatura, TISS XML

---

## File List

| Arquivo | Acao |
|---------|------|
| `src/crypto/types.ts` | Criado |
| `src/crypto/certificate-manager.ts` | Criado |
| `src/crypto/xml-signer.ts` | Criado |
| `src/crypto/certificate-manager.test.ts` | Criado |
| `src/crypto/xml-signer.test.ts` | Criado |
| `src/index.ts` | Modificado (exports crypto) |
| `package.json` | Modificado (xml-crypto dep) |

---

## Acceptance Criteria

- [x] parsePfx extrai private key + certificate + metadata de .pfx
- [x] Validacao de expiracaoo: rejeita expirados, alerta <30 dias
- [x] XML assinado com XMLDSig enveloped (C14N + RSA-SHA256)
- [x] Assinatura verificavel via verify()
- [x] Deteccao de adulteraccao (tampered content → valid: false)
- [x] Certificado errado → valid: false
- [x] Extracao de CNPJ/CPF do subject ICP-Brasil
- [x] 24 testes passando
- [x] TypeScript compila sem erros
