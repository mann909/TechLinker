import pkg from 'cloudinary';
const { v2: cloudinary } = pkg;
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { configDotenv } from 'dotenv';

configDotenv()


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'TechLink',
    resource_type: 'auto',
    public_id: (req, file) => Date.now() + '-' + file.originalname
  }
});

const upload = multer({ storage: storage });

const uploadToCloudinary = (filePath, folder = 'TechLink') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
  });
};

export   { upload, uploadToCloudinary };