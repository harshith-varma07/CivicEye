const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { getIPFSClient } = require('../config/ipfs');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  },
});

// @desc    Upload media to Cloudinary
// @route   POST /api/upload/cloudinary
// @access  Private
const uploadToCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'civiceye',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      cloudinaryId: result.public_id,
      type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload media to IPFS
// @route   POST /api/upload/ipfs
// @access  Private
const uploadToIPFS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ipfsClient = getIPFSClient();

    if (!ipfsClient) {
      return res.status(503).json({ message: 'IPFS service not available' });
    }

    // Upload to IPFS
    const result = await ipfsClient.add(req.file.buffer);

    res.json({
      ipfsHash: result.path,
      url: `https://ipfs.infura.io/ipfs/${result.path}`,
      type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  uploadToIPFS,
};