export function approxBase64Bytes(b64: string): number {
  const raw = (b64.includes(',') ? b64.split(',')[1] : b64).replace(/[^A-Za-z0-9+/=]/g, '');
  const padding = raw.endsWith('==') ? 2 : raw.endsWith('=') ? 1 : 0;
  return Math.floor(raw.length * 3 / 4 - padding);
}

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
