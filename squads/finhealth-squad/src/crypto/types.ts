/**
 * Crypto Types
 * FinHealth Squad — Digital Certificate & XML Signing
 */

export interface CertificateInfo {
  commonName: string;
  serialNumber: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  cnpj?: string;
  cpf?: string;
  fingerprint: string;
}

export interface CertificateValidation {
  valid: boolean;
  expired: boolean;
  daysUntilExpiry: number;
  errors: string[];
  warnings: string[];
  info: CertificateInfo;
}

export interface SigningResult {
  signedXml: string;
  signatureValue: string;
  certificateInfo: CertificateInfo;
  signedAt: Date;
}

export interface VerificationResult {
  valid: boolean;
  errors: string[];
}
