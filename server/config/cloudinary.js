import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({ secure: true }) // reads CLOUDINARY_URL from .env
export default cloudinary
