const sharp = require('sharp');

/**
 * Sharp Configuration
 * Centralized image processing settings
 */

const SHARP_CONFIG = {
  // Maximum dimensions (maintains aspect ratio)
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1200,
  
  // Quality settings (0-100)
  JPEG_QUALITY: 85,
  PNG_QUALITY: 85,
  WEBP_QUALITY: 85,
  
  // Compression
  PNG_COMPRESSION_LEVEL: 8, // 0-9, higher = smaller but slower
  
  // Resize options
  RESIZE_FIT: 'inside', // 'cover', 'contain', 'fill', 'inside', 'outside'
  WITHOUT_ENLARGEMENT: true // Don't upscale small images
};

/**
 * Optimize an image with Sharp
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save optimized image
 * @returns {Promise<sharp.OutputInfo>}
 */
const optimizeImage = async (inputPath, outputPath) => {
  return await sharp(inputPath)
    .resize(SHARP_CONFIG.MAX_WIDTH, SHARP_CONFIG.MAX_HEIGHT, {
      fit: SHARP_CONFIG.RESIZE_FIT,
      withoutEnlargement: SHARP_CONFIG.WITHOUT_ENLARGEMENT
    })
    .jpeg({ 
      quality: SHARP_CONFIG.JPEG_QUALITY, 
      progressive: true 
    })
    .png({ 
      quality: SHARP_CONFIG.PNG_QUALITY, 
      compressionLevel: SHARP_CONFIG.PNG_COMPRESSION_LEVEL 
    })
    .webp({ 
      quality: SHARP_CONFIG.WEBP_QUALITY 
    })
    .toFile(outputPath);
};

/**
 * Get image metadata
 * @param {string} imagePath - Path to image
 * @returns {Promise<sharp.Metadata>}
 */
const getImageMetadata = async (imagePath) => {
  return await sharp(imagePath).metadata();
};

/**
 * Create thumbnail
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save thumbnail
 * @param {number} size - Thumbnail size (default 200x200)
 * @returns {Promise<sharp.OutputInfo>}
 */
const createThumbnail = async (inputPath, outputPath, size = 200) => {
  return await sharp(inputPath)
    .resize(size, size, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
};

module.exports = {
  SHARP_CONFIG,
  optimizeImage,
  getImageMetadata,
  createThumbnail
};
