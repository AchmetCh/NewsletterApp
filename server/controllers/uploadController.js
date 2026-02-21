const path = require('path');
const fs = require('fs').promises;
const { optimizeImage } = require('../utils/imageProcessor');

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const extension = path.extname(filename);
    const nameWithoutExt = path.basename(filename, extension);
    
    // Create optimized filename
    const optimizedFilename = `${nameWithoutExt}-optimized${extension}`;
    const optimizedPath = path.join('uploads', optimizedFilename);

    // Process image with Sharp (using centralized config)
    await optimizeImage(originalPath, optimizedPath);

    // Delete original unoptimized file
    await fs.unlink(originalPath);

    // Construct the public URL for the optimized image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${optimizedFilename}`;

    res.json({
      message: 'Image uploaded and optimized successfully',
      url: imageUrl,
      filename: optimizedFilename
    });
  } catch (error) {
    // Clean up files on error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    next(error);
  }
};

module.exports = {
  uploadImage
};
