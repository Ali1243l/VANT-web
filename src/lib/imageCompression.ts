/**
 * Client-Side Image Compression Utility using HTML5 Canvas.
 * Path: src/lib/imageCompression.ts
 *
 * Target settings:
 * - Max width / height: 1920px (preserving aspect ratio)
 * - Output format: image/jpeg
 * - Quality rating: 0.8
 *
 * Turns heavy 5MB-15MB raw smartphone/camera photos into crisp, lightweight ~200-400KB web-optimized images.
 */

export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.8
): Promise<File> {
  // If not an image, return original
  if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
    return file;
  }

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(file);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Downscale proportionally if dimensions exceed max boundaries
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('Canvas 2D context unavailable, returning original file');
          resolve(file);
          return;
        }

        // Draw and compress onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.warn('Canvas toBlob failed, returning original file');
              resolve(file);
              return;
            }

            const cleanBaseName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File([blob], `${cleanBaseName}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log(
              `[Auto-Compress] ${file.name}: ${(file.size / 1024).toFixed(1)} KB -> ${(compressedFile.size / 1024).toFixed(1)} KB (${width}x${height}px)`
            );

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = (err) => {
        console.warn('Failed to load image for compression, falling back to original:', err);
        resolve(file);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => {
      console.warn('Failed to read image for compression, falling back to original:', err);
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress an array of files in sequence with optional progress feedback.
 */
export async function compressMultipleImages(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const result: File[] = [];
  for (let i = 0; i < files.length; i++) {
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
    const compressed = await compressImage(files[i]);
    result.push(compressed);
  }
  return result;
}
