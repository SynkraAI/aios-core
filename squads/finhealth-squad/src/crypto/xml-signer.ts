/**
 * XML Signer
 * FinHealth Squad — XMLDSig enveloped signature for TISS XML
 *
 * Implements XMLDSig (enveloped) signature using xml-crypto.
 * Follows ANS TISS standard: C14N canonicalization, SHA-256 digest, RSA-SHA256 signature.
 *
 * Reference: ANS TISS v4.01.00 — Padrao de Troca de Informacoes em Saude Suplementar
 */

import { SignedXml } from 'xml-crypto';
import * as crypto from 'crypto';
import { logger } from '../logger';
import type { CertificateInfo, SigningResult, VerificationResult } from './types';

// XMLDSig algorithm URIs
const C14N_ALGO = 'http://www.w3.org/2001/10/xml-exc-c14n#';
const SIGNATURE_ALGO = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
const DIGEST_ALGO = 'http://www.w3.org/2001/04/xmlenc#sha256';
const ENVELOPED_TRANSFORM = 'http://www.w3.org/2000/09/xmldsig#enveloped-signature';

export class XmlSigner {
  /**
   * Sign an XML document using XMLDSig (enveloped signature).
   *
   * @param xml - The XML string to sign
   * @param privateKeyPem - PEM-encoded private key (RSA)
   * @param certificatePem - PEM-encoded public key/certificate
   * @param certificateInfo - Certificate metadata for the result
   * @returns SigningResult with signed XML
   */
  sign(
    xml: string,
    privateKeyPem: string,
    certificatePem: string,
    certificateInfo: CertificateInfo,
  ): SigningResult {
    const sig = new SignedXml({
      signatureAlgorithm: SIGNATURE_ALGO,
      canonicalizationAlgorithm: C14N_ALGO,
      privateKey: privateKeyPem,
      publicCert: certificatePem,
    });

    // Add reference to root element with enveloped transform + C14N
    sig.addReference({
      xpath: '/*',
      transforms: [ENVELOPED_TRANSFORM, C14N_ALGO],
      digestAlgorithm: DIGEST_ALGO,
      uri: '',
      isEmptyUri: true,
    });

    // Compute signature
    sig.computeSignature(xml, {
      prefix: 'ds',
      location: {
        reference: '/*',
        action: 'append',
      },
      existingPrefixes: {
        ans: 'http://www.ans.gov.br/padroes/tiss/schemas',
      },
    });

    const signedXml = sig.getSignedXml();
    const signatureValue = sig.getSignatureXml();

    logger.info('[XmlSigner] XML signed successfully', {
      certificate: certificateInfo.commonName,
      algorithm: 'RSA-SHA256',
    });

    return {
      signedXml,
      signatureValue,
      certificateInfo,
      signedAt: new Date(),
    };
  }

  /**
   * Verify an XMLDSig signature.
   *
   * @param signedXml - The signed XML string
   * @param certificatePem - PEM-encoded public key/certificate for verification
   * @returns VerificationResult
   */
  verify(signedXml: string, certificatePem: string): VerificationResult {
    const errors: string[] = [];

    try {
      const sig = new SignedXml({
        publicCert: certificatePem,
      });

      // Find the Signature element
      const signatureMatch = signedXml.match(/<(?:ds:)?Signature[\s>]/);
      if (!signatureMatch) {
        return { valid: false, errors: ['No Signature element found in XML'] };
      }

      // Extract signature node substring
      const sigStartIdx = signedXml.indexOf('<ds:Signature');
      const sigStart2Idx = signedXml.indexOf('<Signature');
      const actualStartIdx = sigStartIdx !== -1 ? sigStartIdx : sigStart2Idx;

      if (actualStartIdx === -1) {
        return { valid: false, errors: ['Could not locate Signature element'] };
      }

      const sigEndTag = sigStartIdx !== -1 ? '</ds:Signature>' : '</Signature>';
      const sigEndIdx = signedXml.indexOf(sigEndTag);
      if (sigEndIdx === -1) {
        return { valid: false, errors: ['Malformed Signature element'] };
      }

      const signatureXml = signedXml.substring(actualStartIdx, sigEndIdx + sigEndTag.length);

      sig.loadSignature(signatureXml);

      const valid = sig.checkSignature(signedXml);

      if (!valid) {
        errors.push(...(sig as unknown as { validationErrors: string[] }).validationErrors);
      }

      return { valid, errors };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { valid: false, errors: [`Verification failed: ${msg}`] };
    }
  }

  /**
   * Generate a self-signed test certificate and private key.
   * Used for testing only — NOT for production.
   */
  static generateTestCertificate(commonName = 'FinHealth Test Certificate'): {
    certificate: string;
    privateKey: string;
    info: CertificateInfo;
  } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const fingerprint = crypto.createHash('sha256').update(publicKey).digest('hex');
    const now = new Date();
    const validTo = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const info: CertificateInfo = {
      commonName,
      serialNumber: fingerprint.substring(0, 16),
      issuer: `CN=${commonName}, O=FinHealth Test, C=BR`,
      subject: `CN=${commonName}, O=FinHealth Test, C=BR`,
      validFrom: now,
      validTo,
      fingerprint,
    };

    return {
      certificate: publicKey,
      privateKey,
      info,
    };
  }
}
