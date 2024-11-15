import crypto from 'crypto';

export const encryptData = (data: string, secretKey: string): string => {
  const key = Buffer.alloc(32, secretKey);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
