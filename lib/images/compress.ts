export async function maybeCompressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file; // skip PDFs
  // Skip tiny files
  if (file.size < 400 * 1024) return file;

  try {
    // Use native Canvas compression to avoid a new dependency.
    const blob = await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1920;
        let { width, height } = img;
        if (width > height && width > maxDim) { 
          height = Math.round(height * (maxDim / width)); 
          width = maxDim; 
        } else if (height > maxDim) { 
          width = Math.round(width * (maxDim / height)); 
          height = maxDim; 
        }
        canvas.width = width; 
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('compress-failed')), 'image/jpeg', 0.8);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

    const compressedFile = new File([blob], file.name.replace(/\.(png|webp)$/i,'') + '.jpg', { type: 'image/jpeg' });
    
    // Only use compressed version if it's actually smaller
    return compressedFile.size < file.size ? compressedFile : file;
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return file;
  }
}
