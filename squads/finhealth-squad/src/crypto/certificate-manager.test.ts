/**
 * Certificate Manager Tests
 * FinHealth Squad — Phase 11
 */

import { describe, it, expect } from 'vitest';
import { CertificateManager } from './certificate-manager';
import type { CertificateInfo } from './types';

describe('CertificateManager', () => {
  const manager = new CertificateManager();

  describe('createInfo()', () => {
    it('should create certificate info from fields', () => {
      const info = manager.createInfo({
        commonName: 'Hospital Teste LTDA',
        serialNumber: 'ABC123',
        issuer: 'CN=AC Teste, O=ICP-Brasil',
        subject: 'CN=Hospital Teste LTDA, OU=RFB e-CNPJ A1',
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2027-01-01'),
        cnpj: '12.345.678/0001-90',
      });

      expect(info.commonName).toBe('Hospital Teste LTDA');
      expect(info.serialNumber).toBe('ABC123');
      expect(info.cnpj).toBe('12.345.678/0001-90');
      expect(info.fingerprint).toBeTruthy();
    });

    it('should generate fingerprint when not provided', () => {
      const info = manager.createInfo({
        commonName: 'Test',
        serialNumber: 'SN001',
        issuer: 'Issuer',
        subject: 'Subject',
        validFrom: new Date(),
        validTo: new Date(),
      });

      expect(info.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should use provided fingerprint', () => {
      const info = manager.createInfo({
        commonName: 'Test',
        serialNumber: 'SN001',
        issuer: 'Issuer',
        subject: 'Subject',
        validFrom: new Date(),
        validTo: new Date(),
        fingerprint: 'custom-fingerprint-hash',
      });

      expect(info.fingerprint).toBe('custom-fingerprint-hash');
    });
  });

  describe('validate()', () => {
    it('should validate a valid (non-expired) certificate', () => {
      const now = new Date();
      const info: CertificateInfo = {
        commonName: 'Hospital Teste',
        serialNumber: 'SN001',
        issuer: 'CN=AC Teste',
        subject: 'CN=Hospital Teste',
        validFrom: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        validTo: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        fingerprint: 'abc123',
      };

      const result = manager.validate(info);
      expect(result.valid).toBe(true);
      expect(result.expired).toBe(false);
      expect(result.errors).toHaveLength(0);
      expect(result.daysUntilExpiry).toBeGreaterThan(300);
    });

    it('should detect expired certificate', () => {
      const info: CertificateInfo = {
        commonName: 'Hospital Expirado',
        serialNumber: 'SN002',
        issuer: 'CN=AC Teste',
        subject: 'CN=Hospital Expirado',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-01-01'),
        fingerprint: 'expired123',
      };

      const result = manager.validate(info);
      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('expired');
    });

    it('should detect not-yet-valid certificate', () => {
      const now = new Date();
      const info: CertificateInfo = {
        commonName: 'Hospital Futuro',
        serialNumber: 'SN003',
        issuer: 'CN=AC Teste',
        subject: 'CN=Hospital Futuro',
        validFrom: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        validTo: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        fingerprint: 'future123',
      };

      const result = manager.validate(info);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('not yet valid');
    });

    it('should warn when certificate expires within 30 days', () => {
      const now = new Date();
      const info: CertificateInfo = {
        commonName: 'Hospital Quase Expirando',
        serialNumber: 'SN004',
        issuer: 'CN=AC Teste',
        subject: 'CN=Hospital Quase Expirando',
        validFrom: new Date(now.getTime() - 335 * 24 * 60 * 60 * 1000),
        validTo: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        fingerprint: 'almost123',
      };

      const result = manager.validate(info);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('expires in');
      expect(result.daysUntilExpiry).toBeLessThanOrEqual(30);
    });

    it('should warn if commonName is empty', () => {
      const now = new Date();
      const info: CertificateInfo = {
        commonName: '',
        serialNumber: 'SN005',
        issuer: 'CN=AC Teste',
        subject: 'CN=',
        validFrom: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        validTo: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        fingerprint: 'nocn123',
      };

      const result = manager.validate(info);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringContaining('Common Name'));
    });

    it('should return daysUntilExpiry as 0 for expired certs', () => {
      const info: CertificateInfo = {
        commonName: 'Expired',
        serialNumber: 'SN006',
        issuer: 'issuer',
        subject: 'subject',
        validFrom: new Date('2023-01-01'),
        validTo: new Date('2024-01-01'),
        fingerprint: 'fp',
      };

      const result = manager.validate(info);
      expect(result.daysUntilExpiry).toBe(0);
    });

    it('should include CertificateInfo in result', () => {
      const now = new Date();
      const info: CertificateInfo = {
        commonName: 'Test',
        serialNumber: 'SN007',
        issuer: 'I',
        subject: 'S',
        validFrom: new Date(now.getTime() - 1000),
        validTo: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        fingerprint: 'fp7',
        cnpj: '12.345.678/0001-90',
      };

      const result = manager.validate(info);
      expect(result.info).toEqual(info);
      expect(result.info.cnpj).toBe('12.345.678/0001-90');
    });
  });
});
