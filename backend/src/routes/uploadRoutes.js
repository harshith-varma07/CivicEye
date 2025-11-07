const express = require('express');
const {
  upload,
  uploadToCloudinary,
  uploadToIPFS,
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/cloudinary', protect, upload.single('file'), uploadToCloudinary);
router.post('/ipfs', protect, upload.single('file'), uploadToIPFS);

module.exports = router;
