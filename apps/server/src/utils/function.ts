import { randomUUID } from 'crypto';

export function sluggify(title: string): string {
  const MAX_LENGTH = 256;
  const TIMESTAMP_LENGTH = 1 + Date.now().toString(36).length;
  const MAX_SLUG_LENGTH = MAX_LENGTH - TIMESTAMP_LENGTH;

  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH);

  const timestamp = Date.now().toString(36);

  return `${baseSlug}-${timestamp}`;
}

export function generateUsernameByEmail(email: string): string {
  const userName = email.split('@')[0];
  const sanitizedUsername = userName?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || '';
  const domain = email.split('@')[1];
  return `${sanitizedUsername}-${domain}`;
}

function shortId() {
  // Remove hyphens, convert to base36, take first 8 chars
  return parseInt(randomUUID().replace(/-/g, '').slice(0, 12), 16).toString(36).slice(0, 8);
}

export function generateUniqueUsername(prefix = 'guest-user') {
  return `${prefix}-${shortId()}`;
}
// Helper to check for valid objects (excludes null and arrays)
export function isObject(val: any): boolean {
  return val && typeof val === 'object' && !Array.isArray(val);
}
