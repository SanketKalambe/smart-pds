const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_cloudinary_secret'
});

/**
 * Upload file buffer or base64 to Cloudinary or return local mock URL
 */
const uploadMedia = async (fileBufferOrPath, folder = 'smart-pds') => {
  try {
    // If Cloudinary keys are standard defaults, use mock placeholder URL for reliability
    if (!process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET === 'mock_cloudinary_secret') {
      const mockId = Math.floor(Math.random() * 1000);
      return {
        url: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&id=${mockId}`,
        public_id: `mock_pds_doc_${mockId}`
      };
    }

    const result = await cloudinary.uploader.upload(fileBufferOrPath, {
      folder,
      resource_type: 'auto'
    });

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    return {
      url: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60`,
      public_id: `fallback_pds_doc`
    };
  }
};

module.exports = {
  uploadMedia
};
