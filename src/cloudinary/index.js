import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for event photos
const eventPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'event_photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// Configure Cloudinary storage for user profile pictures
const userPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user_photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

export { eventPhotoStorage, userPhotoStorage };
