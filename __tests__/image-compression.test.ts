import { maybeCompressImage } from '@/lib/images/compress';

// Mock DOM APIs for testing
global.Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  width = 1920;
  height = 1080;
  
  constructor() {
    // Simulate image loading
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
} as any;

global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
}));

global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
  const mockBlob = new Blob(['compressed'], { type: 'image/jpeg' });
  callback(mockBlob);
});

global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('Image Compression', () => {
  test('should pass through non-image files unchanged', async () => {
    const pdfFile = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' });
    const result = await maybeCompressImage(pdfFile);
    
    expect(result).toBe(pdfFile);
  });
  
  test('should pass through small images unchanged', async () => {
    const smallImage = new File(['small'], 'small.jpg', { type: 'image/jpeg' });
    Object.defineProperty(smallImage, 'size', { value: 100 * 1024 }); // 100KB
    
    const result = await maybeCompressImage(smallImage);
    
    expect(result).toBe(smallImage);
  });
  
  test('should compress large images', async () => {
    const largeImage = new File(['large image data'], 'large.png', { type: 'image/png' });
    Object.defineProperty(largeImage, 'size', { value: 5 * 1024 * 1024 }); // 5MB
    
    const result = await maybeCompressImage(largeImage);
    
    expect(result).not.toBe(largeImage);
    expect(result.type).toBe('image/jpeg');
    expect(result.name.endsWith('.jpg')).toBe(true);
  });
  
  test('should handle compression errors gracefully', async () => {
    // Mock Image constructor to throw error
    const originalImage = global.Image;
    global.Image = class {
      constructor() {
        setTimeout(() => {
          if (this.onerror) this.onerror();
        }, 10);
      }
    } as any;
    
    const image = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(image, 'size', { value: 5 * 1024 * 1024 }); // 5MB
    
    const result = await maybeCompressImage(image);
    
    // Should return original file on error
    expect(result).toBe(image);
    
    // Restore original Image
    global.Image = originalImage;
  });
});
