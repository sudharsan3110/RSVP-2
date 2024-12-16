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
