import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'GestionIncidencias', 
    allowedFormats: ['jpeg', 'png', 'jpg', 'gif'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }],
    public_id: (req, file) => {
        const fileName = path.basename(file.originalname, path.extname(file.originalname));
        return `GI_${Date.now()}_${fileName}`;
    }, 
  },
});

const uploadMiddleware = multer({ storage: storage });

export default uploadMiddleware;