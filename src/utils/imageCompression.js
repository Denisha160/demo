/**
 * Image compression utility to ensure files are under 2MB for API compatibility
 */

/**
 * Compresses an image file to ensure it's under the target size
 * @param {File} file - The image file to compress
 * @param {number} targetMaxSize - Target maximum size in bytes (default: 2MB)
 * @param {number} absoluteMaxSize - Absolute maximum size in bytes (default: 20MB)
 * @returns {Promise<File>} - Compressed file
 */
export const compressImage = (
  file,
  targetMaxSize = 0.7 * 1024 * 1024,
  absoluteMaxSize = 20 * 1024 * 1024
) => {
  return new Promise((resolve, reject) => {
    // Check file extension first
    const supportedExtensions = [".jpeg", ".jpg", ".png", ".gif", ".webp"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!supportedExtensions.includes(fileExtension)) {
      reject(
        new Error(
          `File type ${fileExtension} is not supported. Please use: JPG, PNG, GIF, WebP`
        )
      );
      return;
    }

    // If file is already under target size, no compression needed
    if (file.size <= targetMaxSize) {
      resolve(file);
      return;
    }

    // If file is over absolute max size, reject it
    if (file.size > absoluteMaxSize) {
      reject(
        new Error(
          `${file.name} is too large (${(file.size / (1024 * 1024)).toFixed(
            1
          )}MB). Maximum allowed is ${(absoluteMaxSize / (1024 * 1024)).toFixed(
            0
          )}MB.`
        )
      );
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img");

    img.onload = () => {
      // Calculate optimal dimensions for compression
      let { width, height } = img;

      // Start with a reasonable max dimension, but be more aggressive for large files
      let maxDimension = 1920;
      if (file.size > 5 * 1024 * 1024) {
        // If file is over 5MB
        maxDimension = 1200; // Use smaller max dimension
      } else if (file.size > 2 * 1024 * 1024) {
        // If file is over 2MB
        maxDimension = 1600; // Use medium max dimension
      }

      let scale = 1;

      if (width > maxDimension || height > maxDimension) {
        scale = Math.min(maxDimension / width, maxDimension / height);
        width *= scale;
        height *= scale;
      }

      canvas.width = width;
      canvas.height = height;

      // Use better quality settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Try different quality levels for optimal compression to reach target size
      const tryCompression = (quality) => {
        return new Promise((resolveBlob) => {
          canvas.toBlob(
            (blob) => {
              if (blob.size <= targetMaxSize || quality <= 0.1) {
                resolveBlob(blob);
              } else {
                // Try with lower quality
                tryCompression(quality - 0.1).then(resolveBlob);
              }
            },
            file.type,
            quality
          );
        });
      };

      // Start with 0.8 quality
      tryCompression(0.8).then((blob) => {
        const compressedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Formats file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Checks if a file needs compression
 * @param {File} file - The file to check
 * @param {number} targetMaxSize - Target maximum size in bytes (default: 2MB)
 * @returns {boolean} - True if compression is needed
 */
export const needsCompression = (file, targetMaxSize = 2 * 1024 * 1024) => {
  return file.size > targetMaxSize;
};
