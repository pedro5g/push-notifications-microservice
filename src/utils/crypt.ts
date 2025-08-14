import {
  type BinaryLike,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt,
} from "node:crypto";
import { env } from "@/config/env";

const asyncScrypt = (
  password: BinaryLike,
  salt: BinaryLike,
  keylen: number
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });
};

const LEN = 64;

export const toHash = async (
  password: string,
  salt?: string
): Promise<string> => {
  const _salt = salt ? salt : randomBytes(10).toString("hex");
  const _hash = await asyncScrypt(password, _salt, LEN);
  return `${_salt}.${_hash.toString("hex")}`;
};

export const compareHashes = async (
  hash: string,
  password: string
): Promise<boolean> => {
  const [_salt, _h] = hash.split(".");
  const _sameHash = await asyncScrypt(password, _salt || "", LEN);
  return _h === _sameHash.toString("hex");
};

const ENCRYPTION_KEY = env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

export const encryptSensitiveInformation = (text: string): string => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decryptSensitiveInformation = (encryptedText: string): string => {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex || "", "hex");
  const encrypted = Buffer.from(encryptedHex || "", "hex");
  const decipher = createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

export const genApiKey = () => {
  return randomBytes(32).toString("hex");
};

export const generateSecret = () => {
  return randomBytes(32).toString("hex");
};
