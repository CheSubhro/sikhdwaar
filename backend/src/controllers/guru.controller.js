import mongoose from "mongoose";

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import HttpStatus from "../utils/HttpStatus.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Guru } from "../models/guru.model.js";

import { createGuruSchema, updateGuruSchema } from "../utils/Validation.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/Cloudinary.js";

// Parse Multipart Form Data
const parseRequestBody = (body) => {
    const parsedBody = { ...body };

    const jsonFields = [
        "family",
        "teachings",
        "contributions",
        "importantEvents",
    ];

    for (const field of jsonFields) {
        if (typeof parsedBody[field] === "string") {
            try {
                parsedBody[field] = JSON.parse(parsedBody[field]);
            } catch {
                throw new ApiError(
                    HttpStatus.BAD_REQUEST,
                    `Invalid JSON format for ${field}`
                );
            }
        }
    }

    if (typeof parsedBody.isFeatured === "string") {
        parsedBody.isFeatured = parsedBody.isFeatured === "true";
    }

    return parsedBody;
};

// Generate Unique Slug
const generateUniqueSlug = async (name, excludeId = null) => {
    const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existingGuru = await Guru.findOne(query);

        if (!existingGuru) {
            return slug;
        }

        slug = `${baseSlug}-${counter++}`;
    }
};

// Upload Single Image
const uploadImage = async (file) => {
    if (!file) return null;

    const response = await uploadOnCloudinary(file.path);

    if (!response) {
        throw new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Image upload failed"
        );
    }

    return {
        url: response.secure_url,
        publicId: response.public_id,
    };
};

// Upload Multiple Images
const uploadImages = async (files = []) => {
    const uploadedImages = [];

    for (const file of files) {
        const image = await uploadImage(file);
        uploadedImages.push(image);
    }

    return uploadedImages;
};

// Delete Uploaded Cloudinary Images on Failure
const cleanupCloudinaryImages = async (images = []) => {
    for (const image of images) {
        if (image?.publicId) {
            await deleteFromCloudinary(image.publicId);
        }
    }
};

// Validate MongoDB ObjectId
const validateGuruId = (guruId) => {
    if (!mongoose.isValidObjectId(guruId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Guru ID");
    }
};

// Public: Get Published Gurus
const getPublishedGurus = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const { search, featured } = req.query;

    const filter = { status: "published" };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
            { shortDescription: { $regex: search, $options: "i" } },
        ];
    }

    if (featured === "true") {
        filter.isFeatured = true;
    }

    const [gurus, total] = await Promise.all([
        Guru.find(filter)
            .select("-createdBy -updatedBy")
            .sort({ guruNumber: 1 })
            .skip(skip)
            .limit(limit),

        Guru.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                gurus,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
            "Published Gurus fetched successfully"
        )
    );
});

// Public: Get Published Guru By Slug
const getPublishedGuruBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const guru = await Guru.findOne({
        slug,
        status: "published",
    }).select("-createdBy -updatedBy");

    if (!guru) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Guru not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                guru,
                "Guru details fetched successfully"
            )
        );
});

// Admin: Get All Gurus
const getAllGurus = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    const filter = {};

    if (status && ["draft", "published"].includes(status)) {
        filter.status = status;
    }

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
        ];
    }

    const [gurus, total] = await Promise.all([
        Guru.find(filter)
            .populate("createdBy", "fullName username")
            .populate("updatedBy", "fullName username")
            .sort({ guruNumber: 1 })
            .skip(skip)
            .limit(limit),

        Guru.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                gurus,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
            "Gurus fetched successfully"
        )
    );
});

// Admin: Get Guru By ID
const getGuruById = asyncHandler(async (req, res) => {
    const { guruId } = req.params;

    validateGuruId(guruId);

    const guru = await Guru.findById(guruId)
        .populate("createdBy", "fullName username")
        .populate("updatedBy", "fullName username");

    if (!guru) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Guru not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                guru,
                "Guru details fetched successfully"
            )
        );
});

// Admin: Create Guru
const createGuru = asyncHandler(async (req, res) => {
    const body = parseRequestBody(req.body);

    const validation = createGuruSchema.safeParse(body);

    if (!validation.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid Guru data",
            validation.error.issues
        );
    }

    const guruData = validation.data;

    // Check Duplicate Guru Number
    const existingGuru = await Guru.findOne({
        guruNumber: guruData.guruNumber,
    });

    if (existingGuru) {
        throw new ApiError(
            HttpStatus.CONFLICT,
            "This Guru number already exists"
        );
    }

    const uploadedAssets = [];

    try {
        // Generate Unique Slug
        guruData.slug = await generateUniqueSlug(
            guruData.slug || guruData.name
        );

        // Upload Cover Image
        const coverFile = req.files?.coverImage?.[0];

        if (coverFile) {
            const coverImage = await uploadImage(coverFile);

            if (coverImage) {
                uploadedAssets.push(coverImage);
                guruData.coverImage = coverImage;
            }
        }

        // Upload Gallery Images
        const imageFiles = req.files?.images || [];

        if (imageFiles.length > 0) {
            const images = await uploadImages(imageFiles);

            uploadedAssets.push(...images);
            guruData.images = images;
        }

        // Create Guru
        const guru = await Guru.create({
            ...guruData,
            createdBy: req.user._id,
        });

        return res
            .status(HttpStatus.CREATED)
            .json(
                new ApiResponse(
                    HttpStatus.CREATED,
                    guru,
                    "Guru created successfully"
                )
            );
    } catch (error) {
        await cleanupCloudinaryImages(uploadedAssets);

        if (error.code === 11000) {
            throw new ApiError(
                HttpStatus.CONFLICT,
                "Guru number or slug already exists"
            );
        }

        throw error;
    }
});

// Admin: Update Guru
const updateGuru = asyncHandler(async (req, res) => {
    const { guruId } = req.params;

    validateGuruId(guruId);

    const guru = await Guru.findById(guruId);

    if (!guru) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Guru not found");
    }

    const body = parseRequestBody(req.body);

    const validation = updateGuruSchema.safeParse(body);

    if (!validation.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid Guru data",
            validation.error.issues
        );
    }

    const updateData = validation.data;

    // Check Duplicate Guru Number
    if (updateData.guruNumber !== undefined) {
        const existingGuru = await Guru.findOne({
            guruNumber: updateData.guruNumber,
            _id: { $ne: guruId },
        });

        if (existingGuru) {
            throw new ApiError(
                HttpStatus.CONFLICT,
                "This Guru number already exists"
            );
        }
    }

    const uploadedAssets = [];
    const previousCoverImage = guru.coverImage;

    try {
        // Update Slug if Name or Slug Changes
        if (updateData.name || updateData.slug) {
            updateData.slug = await generateUniqueSlug(
                updateData.slug || updateData.name || guru.name,
                guruId
            );
        }

        // Upload New Cover Image
        const coverFile = req.files?.coverImage?.[0];

        if (coverFile) {
            const coverImage = await uploadImage(coverFile);

            if (coverImage) {
                uploadedAssets.push(coverImage);
                updateData.coverImage = coverImage;
            }
        }

        // Upload New Gallery Images
        const imageFiles = req.files?.images || [];

        if (imageFiles.length > 0) {
            const images = await uploadImages(imageFiles);

            uploadedAssets.push(...images);

            updateData.images = [...guru.images, ...images];
        }

        // Update Guru
        Object.assign(guru, updateData);
        guru.updatedBy = req.user._id;

        await guru.save();

        // Delete Previous Cover Image After Successful Update
        if (coverFile && previousCoverImage?.publicId) {
            await deleteFromCloudinary(previousCoverImage.publicId);
        }

        return res
            .status(HttpStatus.OK)
            .json(
                new ApiResponse(
                    HttpStatus.OK,
                    guru,
                    "Guru updated successfully"
                )
            );
    } catch (error) {
        await cleanupCloudinaryImages(uploadedAssets);

        if (error.code === 11000) {
            throw new ApiError(
                HttpStatus.CONFLICT,
                "Guru number or slug already exists"
            );
        }

        throw error;
    }
});

// Admin: Delete Guru
const deleteGuru = asyncHandler(async (req, res) => {
    const { guruId } = req.params;

    validateGuruId(guruId);

    const guru = await Guru.findById(guruId);

    if (!guru) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Guru not found");
    }

    const imagesToDelete = [guru.coverImage, ...guru.images];

    await Guru.findByIdAndDelete(guruId);

    await cleanupCloudinaryImages(imagesToDelete);

    return res
        .status(HttpStatus.OK)
        .json(new ApiResponse(HttpStatus.OK, {}, "Guru deleted successfully"));
});

export {
    getPublishedGurus,
    getPublishedGuruBySlug,
    getAllGurus,
    getGuruById,
    createGuru,
    updateGuru,
    deleteGuru,
};
