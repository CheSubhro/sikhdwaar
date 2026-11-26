import mongoose from "mongoose";

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import HttpStatus from "../utils/HttpStatus.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Gallery } from "../models/gallery.model.js";

import {
    createGallerySchema,
    updateGallerySchema,
} from "../utils/Validation.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/Cloudinary.js";

// Parse Multipart Form Data
const parseRequestBody = (body) => {
    const data = { ...body };

    // Parse JSON fields
    if (typeof data.tags === "string") {
        try {
            data.tags = JSON.parse(data.tags);
        } catch {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Invalid tags JSON format"
            );
        }
    }

    // Convert Boolean values
    if (typeof data.isFeatured === "string") {
        data.isFeatured = data.isFeatured === "true";
    }

    return data;
};

// Validate MongoDB Gallery ID
const validateGalleryId = (galleryId) => {
    if (!mongoose.Types.ObjectId.isValid(galleryId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Gallery ID");
    }
};

// Escape Regular Expression
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Upload Image to Cloudinary
const uploadGalleryImage = async (localFilePath) => {
    const response = await uploadOnCloudinary(localFilePath);

    if (!response || !response.secure_url || !response.public_id) {
        throw new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Gallery image upload failed"
        );
    }

    return {
        url: response.secure_url,
        publicId: response.public_id,
    };
};

// =========================================
// Public: Get Published Gallery
// =========================================
const getPublishedGallery = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        category,
        album,
        search,
        featured,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));

    const filter = {
        status: "published",
        $or: [{ publishedAt: null }, { publishedAt: { $lte: new Date() } }],
    };

    if (category) {
        filter.category = category;
    }

    if (album) {
        filter.album = album;
    }

    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");

        filter.$and = [
            {
                $or: [
                    { title: searchRegex },
                    { caption: searchRegex },
                    { description: searchRegex },
                    { category: searchRegex },
                    { album: searchRegex },
                    { tags: searchRegex },
                ],
            },
        ];
    }

    if (featured === "true") {
        filter.isFeatured = true;
    }

    const [gallery, total] = await Promise.all([
        Gallery.find(filter)
            .sort({ displayOrder: 1, publishedAt: -1, createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .select("-uploadedBy -updatedBy"),

        Gallery.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                gallery,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber),
                },
            },
            "Gallery fetched successfully"
        )
    );
});

// =========================================
// Public: Get Published Gallery by ID
// =========================================
const getPublishedGalleryById = asyncHandler(async (req, res) => {
    const { galleryId } = req.params;

    validateGalleryId(galleryId);

    const gallery = await Gallery.findOne({
        _id: galleryId,
        status: "published",
        $or: [{ publishedAt: null }, { publishedAt: { $lte: new Date() } }],
    }).select("-uploadedBy -updatedBy");

    if (!gallery) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Gallery image not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                gallery,
                "Gallery image fetched successfully"
            )
        );
});

// =========================================
// Admin: Get All Gallery Images
// =========================================
const getAllGallery = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        search,
        category,
        album,
        status,
        featured,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));

    const filter = {};

    if (category) {
        filter.category = category;
    }

    if (album) {
        filter.album = album;
    }

    if (status) {
        if (!["draft", "published"].includes(status)) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Invalid gallery status"
            );
        }

        filter.status = status;
    }

    if (featured === "true") {
        filter.isFeatured = true;
    } else if (featured === "false") {
        filter.isFeatured = false;
    }

    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");

        filter.$or = [
            { title: searchRegex },
            { caption: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { album: searchRegex },
            { tags: searchRegex },
        ];
    }

    const [gallery, total] = await Promise.all([
        Gallery.find(filter)
            .populate("uploadedBy", "fullName username")
            .populate("updatedBy", "fullName username")
            .sort({ displayOrder: 1, createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber),

        Gallery.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                gallery,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber),
                },
            },
            "Admin gallery fetched successfully"
        )
    );
});

// =========================================
// Admin: Get Gallery Image by ID
// =========================================
const getGalleryById = asyncHandler(async (req, res) => {
    const { galleryId } = req.params;

    validateGalleryId(galleryId);

    const gallery = await Gallery.findById(galleryId)
        .populate("uploadedBy", "fullName username")
        .populate("updatedBy", "fullName username");

    if (!gallery) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Gallery image not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                gallery,
                "Gallery image fetched successfully"
            )
        );
});

// =========================================
// Admin: Create Gallery Image
// =========================================
const createGallery = asyncHandler(async (req, res) => {
    let uploadedImage = null;

    try {
        // Image is required during creation
        if (!req.file) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Gallery image is required"
            );
        }

        // Parse and validate request body
        const requestData = parseRequestBody(req.body);

        const validationResult = createGallerySchema.safeParse(requestData);

        if (!validationResult.success) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Gallery validation failed",
                validationResult.error.issues
            );
        }

        const {
            status = "draft",
            publishedAt,
            ...galleryData
        } = validationResult.data;

        // Upload image to Cloudinary
        uploadedImage = await uploadGalleryImage(req.file.path);

        // Publication date
        let finalPublishedAt = null;

        if (status === "published") {
            finalPublishedAt = publishedAt || new Date();
        }

        // Create Gallery
        const gallery = await Gallery.create({
            ...galleryData,
            image: uploadedImage,
            status,
            publishedAt: finalPublishedAt,
            uploadedBy: req.user._id,
        });

        return res
            .status(HttpStatus.CREATED)
            .json(
                new ApiResponse(
                    HttpStatus.CREATED,
                    gallery,
                    "Gallery image created successfully"
                )
            );
    } catch (error) {
        // Cleanup uploaded Cloudinary image if creation fails
        if (uploadedImage?.publicId) {
            await deleteFromCloudinary(uploadedImage.publicId);
        }

        throw error;
    }
});

// =========================================
// Admin: Update Gallery Image
// =========================================
const updateGallery = asyncHandler(async (req, res) => {
    let uploadedImage = null;

    try {
        const { galleryId } = req.params;

        validateGalleryId(galleryId);

        const gallery = await Gallery.findById(galleryId);

        if (!gallery) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Gallery image not found");
        }

        // Parse and validate request body
        const requestData = parseRequestBody(req.body);

        const validationResult = updateGallerySchema.safeParse(requestData);

        if (!validationResult.success) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Gallery validation failed",
                validationResult.error.issues
            );
        }

        const updateData = validationResult.data;

        // Upload new image if provided
        if (req.file) {
            uploadedImage = await uploadGalleryImage(req.file.path);
        }

        // Keep previous image for Cloudinary cleanup
        const previousImage = gallery.image;

        // Update gallery fields
        Object.assign(gallery, updateData);

        // Replace image only when a new image is uploaded
        if (uploadedImage) {
            gallery.image = uploadedImage;
        }

        // Publication date handling
        if (updateData.status === "published") {
            if (updateData.publishedAt) {
                gallery.publishedAt = updateData.publishedAt;
            } else if (gallery.status !== "published" || !gallery.publishedAt) {
                gallery.publishedAt = new Date();
            }
        }

        if (updateData.status === "draft") {
            gallery.publishedAt = null;
        }

        gallery.updatedBy = req.user._id;

        await gallery.save();

        // Delete previous image after successful replacement
        if (uploadedImage && previousImage?.publicId) {
            await deleteFromCloudinary(previousImage.publicId);
        }

        return res
            .status(HttpStatus.OK)
            .json(
                new ApiResponse(
                    HttpStatus.OK,
                    gallery,
                    "Gallery image updated successfully"
                )
            );
    } catch (error) {
        // Cleanup newly uploaded image if update fails
        if (uploadedImage?.publicId) {
            await deleteFromCloudinary(uploadedImage.publicId);
        }

        throw error;
    }
});

// =========================================
// Admin: Delete Gallery Image
// =========================================
const deleteGallery = asyncHandler(async (req, res) => {
    const { galleryId } = req.params;

    validateGalleryId(galleryId);

    const gallery = await Gallery.findById(galleryId);

    if (!gallery) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Gallery image not found");
    }

    const publicId = gallery.image?.publicId;

    await Gallery.findByIdAndDelete(galleryId);

    // Delete image from Cloudinary
    if (publicId) {
        await deleteFromCloudinary(publicId);
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                {},
                "Gallery image deleted successfully"
            )
        );
});

export {
    getPublishedGallery,
    getPublishedGalleryById,
    getAllGallery,
    getGalleryById,
    createGallery,
    updateGallery,
    deleteGallery,
};
