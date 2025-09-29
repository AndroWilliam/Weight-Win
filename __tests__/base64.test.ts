import { approxBase64Bytes } from '@/lib/images/base64';

describe('Base64 utilities', () => {
  test('approxBase64Bytes counts size correctly', () => {
    const text = btoa('hello world');
    expect(approxBase64Bytes(text)).toBe(11);
  });

  test('handles base64 with data URL prefix', () => {
    const text = 'data:image/png;base64,' + btoa('hello world');
    expect(approxBase64Bytes(text)).toBe(11);
  });

  test('handles padding correctly', () => {
    // "test" encodes to "dGVzdA==" (6 chars with 2 padding)
    const text = btoa('test');
    expect(approxBase64Bytes(text)).toBe(4);
  });

  test('handles single padding correctly', () => {
    // "tests" encodes to "dGVzdHM=" (7 chars with 1 padding)
    const text = btoa('tests');
    expect(approxBase64Bytes(text)).toBe(5);
  });
});
