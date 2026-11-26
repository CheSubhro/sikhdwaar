
import { v2 as cloudinary } from "cloudinary"
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
        });

        return response;
    } catch (error) {
        console.error("Cloudinary Error Details:", {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
            response: error.error,
        });

        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });

        return response;
    } catch (error) {
        console.error("Cloudinary delete failed:", error.message);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };

