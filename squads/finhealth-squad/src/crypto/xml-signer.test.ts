/**
 * XML Signer Tests
 * FinHealth Squad — Phase 11
 */

import { describe, it, expect } from 'vitest';
import { XmlSigner } from './xml-signer';

// ============================================================================
// Test fixtures
// ============================================================================

const SAMPLE_TISS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
  <cabecalho>
    <identificacaoTransacao>
      <tipoTransacao>ENVIO_LOTE_GUIAS</tipoTransacao>
      <sequencialTransacao>1</sequencialTransacao>
      <dataRegistroTransacao>2026-02-16</dataRegistroTransacao>
    </identificacaoTransacao>
    <versaoPadrao>3.05.00</versaoPadrao>
  </cabecalho>
  <prestadorParaOperadora>
    <loteGuias>
      <numeroLote>000000000001</numeroLote>
      <guiasTISS>
        <guiaSP_SADT>
          <cabecalhoGuia>
            <registroANS>999999</registroANS>
            <numeroGuiaPrestador>TEST001</numeroGuiaPrestador>
          </cabecalhoGuia>
          <procedimentosExecutados>
            <procedimentoExecutado>
              <sequencialItem>1</sequencialItem>
              <procedimento>
                <codigoTabela>22</codigoTabela>
                <codigoProcedimento>40301010</codigoProcedimento>
                <descricaoProcedimento>Hemograma completo</descricaoProcedimento>
              </procedimento>
              <quantidadeExecutada>1</quantidadeExecutada>
              <valorUnitario>25.00</valorUnitario>
              <valorTotal>25.00</valorTotal>
            </procedimentoExecutado>
          </procedimentosExecutados>
        </guiaSP_SADT>
      </guiasTISS>
    </loteGuias>
  </prestadorParaOperadora>
</ans:mensagemTISS>`;

const SIMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <data>
    <item id="1">Hello World</item>
    <item id="2">Test Data</item>
  </data>
</root>`;

// ============================================================================
// Tests
// ============================================================================

describe('XmlSigner', () => {
  const signer = new XmlSigner();

  describe('generateTestCertificate()', () => {
    it('should generate a test certificate and private key', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      expect(certificate).toContain('-----BEGIN PUBLIC KEY-----');
      expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(info.commonName).toBe('FinHealth Test Certificate');
      expect(info.fingerprint).toBeTruthy();
      expect(info.validFrom).toBeInstanceOf(Date);
      expect(info.validTo).toBeInstanceOf(Date);
      expect(info.validTo.getTime()).toBeGreaterThan(info.validFrom.getTime());
    });

    it('should accept custom common name', () => {
      const { info } = XmlSigner.generateTestCertificate('Hospital ABC');
      expect(info.commonName).toBe('Hospital ABC');
    });
  });

  describe('sign()', () => {
    it('should sign a simple XML document', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const result = signer.sign(SIMPLE_XML, privateKey, certificate, info);

      expect(result.signedXml).toContain('<ds:Signature');
      expect(result.signedXml).toContain('<ds:SignatureValue');
      expect(result.signedXml).toContain('<ds:DigestValue');
      expect(result.signedXml).toContain('<ds:Reference');
      expect(result.signedXml).toContain('root');
      expect(result.signatureValue).toBeTruthy();
      expect(result.signedAt).toBeInstanceOf(Date);
      expect(result.certificateInfo.commonName).toBe('FinHealth Test Certificate');
    });

    it('should sign TISS XML document', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const result = signer.sign(SAMPLE_TISS_XML, privateKey, certificate, info);

      expect(result.signedXml).toContain('mensagemTISS');
      expect(result.signedXml).toContain('<ds:Signature');
      expect(result.signedXml).toContain('SignatureValue');
      expect(result.signedXml).toContain('guiaSP_SADT');
    });

    it('should use RSA-SHA256 algorithm', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const result = signer.sign(SIMPLE_XML, privateKey, certificate, info);

      expect(result.signedXml).toContain('rsa-sha256');
    });

    it('should use C14N canonicalization', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const result = signer.sign(SIMPLE_XML, privateKey, certificate, info);

      expect(result.signedXml).toContain('xml-exc-c14n#');
    });

    it('should include enveloped signature transform', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const result = signer.sign(SIMPLE_XML, privateKey, certificate, info);

      expect(result.signedXml).toContain('enveloped-signature');
    });

    it('should produce different signatures for different content', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const result1 = signer.sign(SIMPLE_XML, privateKey, certificate, info);
      const result2 = signer.sign(SAMPLE_TISS_XML, privateKey, certificate, info);

      expect(result1.signatureValue).not.toBe(result2.signatureValue);
    });

    it('should produce different signatures with different keys', () => {
      const cert1 = XmlSigner.generateTestCertificate('Cert A');
      const cert2 = XmlSigner.generateTestCertificate('Cert B');

      const result1 = signer.sign(SIMPLE_XML, cert1.privateKey, cert1.certificate, cert1.info);
      const result2 = signer.sign(SIMPLE_XML, cert2.privateKey, cert2.certificate, cert2.info);

      // DigestValue should be the same (same content), but SignatureValue differs (different keys)
      expect(result1.signatureValue).not.toBe(result2.signatureValue);
    });
  });

  describe('verify()', () => {
    it('should verify a correctly signed XML', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const { signedXml } = signer.sign(SIMPLE_XML, privateKey, certificate, info);
      const result = signer.verify(signedXml, certificate);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject XML with tampered content', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const { signedXml } = signer.sign(SIMPLE_XML, privateKey, certificate, info);

      // Tamper with the content
      const tampered = signedXml.replace('Hello World', 'Tampered Data');
      const result = signer.verify(tampered, certificate);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject XML with wrong certificate', () => {
      const cert1 = XmlSigner.generateTestCertificate('Cert A');
      const cert2 = XmlSigner.generateTestCertificate('Cert B');

      const { signedXml } = signer.sign(SIMPLE_XML, cert1.privateKey, cert1.certificate, cert1.info);

      // Verify with wrong certificate
      const result = signer.verify(signedXml, cert2.certificate);
      expect(result.valid).toBe(false);
    });

    it('should fail for XML without signature', () => {
      const { certificate } = XmlSigner.generateTestCertificate();

      const result = signer.verify(SIMPLE_XML, certificate);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('No Signature');
    });

    it('should verify signed TISS XML', () => {
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const { signedXml } = signer.sign(SAMPLE_TISS_XML, privateKey, certificate, info);
      const result = signer.verify(signedXml, certificate);

      expect(result.valid).toBe(true);
    });
  });
});
