import {
  compareHashes,
  decryptSensitiveInformation,
  encryptSensitiveInformation,
  genApiKey,
  generateSecret,
  genFingerprint,
  toHash,
} from './crypt';

vi.mock('@/config/env', () => ({
  env: {
    ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef',
    FINGERPRINT_SALT: 'test_salt',
  },
}));

describe('Security Utils', () => {
  describe('toHash & compareHashes', () => {
    it('should create and validate a hash correctly', async () => {
      const password = 'my_secure_password';
      const hash = await toHash(password);

      const isValid = await compareHashes(hash, password);
      const isInvalid = await compareHashes(hash, 'wrong_password');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('should use provided salt if given', async () => {
      const password = 'password';
      const hash1 = await toHash(password, 'custom_salt');
      const hash2 = await toHash(password, 'custom_salt');

      expect(hash1).toEqual(hash2);
    });
  });

  describe('encryptSensitiveInformation & decryptSensitiveInformation', () => {
    it('should encrypt and decrypt text correctly', () => {
      const secret = 'https://example.com/webhook';
      const encrypted = encryptSensitiveInformation(secret);
      const decrypted = decryptSensitiveInformation(encrypted);

      expect(decrypted).toBe(secret);
    });

    it('should throw if encrypted text is malformed', () => {
      expect(() => decryptSensitiveInformation('invalid')).toThrow();
    });
  });

  describe('genFingerprint', () => {
    it('should generate fingerprint hash from valid input', async () => {
      const fingerprint = '192.168.0.1-Mozilla/5.0';
      const hash = await genFingerprint(fingerprint);

      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/\./);
    });

    it('should throw if fingerprint format is invalid', async () => {
      //@ts-ignore
      await expect(() => genFingerprint('invalid_format')).rejects.toThrow(
        'Invalid finger format: expected format [ip-userAgent]'
      );
    });
  });

  describe('genApiKey', () => {
    it('should generate a non-empty API key string', () => {
      const key = genApiKey();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(10);
    });

    it('should generate different keys each time', () => {
      const key1 = genApiKey();
      const key2 = genApiKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('generateSecret', () => {
    it('should generate a non-empty secret string', () => {
      const secret1 = generateSecret();
      const secret2 = generateSecret();
      const secret3 = generateSecret();
      const secret4 = generateSecret();
      const secret5 = generateSecret();

      expect(secret1).not.toBeFalsy();
      expect(secret2).not.toBeFalsy();
      expect(secret3).not.toBeFalsy();
      expect(secret4).not.toBeFalsy();
      expect(secret5).not.toBeFalsy();
    });

    it('should be a string with (32bytes) 64 chars', () => {
      const secret1 = generateSecret();
      const secret2 = generateSecret();
      const secret3 = generateSecret();
      const secret4 = generateSecret();
      const secret5 = generateSecret();

      expect(secret1.length).toBe(64);
      expect(secret2.length).toBe(64);
      expect(secret3.length).toBe(64);
      expect(secret4.length).toBe(64);
      expect(secret5.length).toBe(64);
    });
  });
});
