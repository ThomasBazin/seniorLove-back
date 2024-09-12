import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Your Cloudinary API secret
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary, // Pass the configured Cloudinary instance
  params: {
    folder: 'event_photos', // The folder in Cloudinary where files will be stored
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Allowed file formats for upload
  },
});

export default storage; // Export the storage configuration for use with Multer
