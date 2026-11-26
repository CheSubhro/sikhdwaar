import mongoose from "mongoose";

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import HttpStatus from "../utils/HttpStatus.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Gurudwara } from "../models/gurudwara.model.js";
import {
    createGurudwaraSchema,
    updateGurudwaraSchema,
} from "../utils/Validation.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/Cloudinary.js";

// Parse JSON fields received through multipart/form-data
const parseRequestBody = (body) => {
    const data = { ...body };

    const jsonFields = [
        "address",
        "contact",
        "location",
        "visitingHours",
        "facilities",
    ];

    for (const field of jsonFields) {
        if (typeof data[field] === "string") {
            try {
                data[field] = JSON.parse(data[field]);
            } catch {
                throw new ApiError(
                    HttpStatus.BAD_REQUEST,
                    `Invalid JSON format for ${field}`
                );
            }
        }
    }

    if (typeof data.isFeatured === "string") {
        if (!["true", "false"].includes(data.isFeatured)) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "isFeatured must be true or false"
            );
        }

        data.isFeatured = data.isFeatured === "true";
    }

    if (data.location) {
        data.location.type = "Point";
    }

    return data;
};

// Generate unique slug
const generateUniqueSlug = async (name, excludeId = null) => {
    const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (
        await Gurudwara.exists({
            slug,
            ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        })
    ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

// Upload one image to Cloudinary
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

// Upload multiple images
const uploadImages = async (files = []) => {
    const uploadedImages = [];

    for (const file of files) {
        const image = await uploadImage(file);
        uploadedImages.push(image);
    }

    return uploadedImages;
};

// Delete uploaded Cloudinary images if an operation fails
const cleanupCloudinaryImages = async (images = []) => {
    await Promise.all(
        images
            .filter(Boolean)
            .map((image) => deleteFromCloudinary(image.publicId))
    );
};

// Get Published Gurudwaras - Public
const getPublishedGurudwaras = asyncHandler(async (req, res) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
        Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
        100
    );

    const filter = { status: "published" };

    if (req.query.search?.trim()) {
        filter.name = {
            $regex: req.query.search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
        };
    }

    if (req.query.district?.trim()) {
        filter["address.district"] = {
            $regex: req.query.district
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
        };
    }

    if (req.query.featured === "true") {
        filter.isFeatured = true;
    }

    const skip = (page - 1) * limit;

    const [gurudwaras, total] = await Promise.all([
        Gurudwara.find(filter)
            .select("-createdBy -updatedBy")
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Gurudwara.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                gurudwaras,
                pagination: {
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    limit,
                },
            },
            "Gurudwaras fetched successfully"
        )
    );
});

// Get Single Published Gurudwara - Public
const getPublishedGurudwaraBySlug = asyncHandler(async (req, res) => {
    const gurudwara = await Gurudwara.findOne({
        slug: req.params.slug,
        status: "published",
    }).select("-createdBy -updatedBy");

    if (!gurudwara) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Gurudwara not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                gurudwara,
                "Gurudwara fetched successfully"
            )
        );
});

// Get All Gurudwaras - Admin
const getAllGurudwaras = asyncHandler(async (req, res) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
        Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
        100
    );

    const filter = {};

    if (req.query.status) {
        if (!["draft", "published"].includes(req.query.status)) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Invalid Gurudwara status"
            );
        }

        filter.status = req.query.status;
    }

    if (req.query.search?.trim()) {
        const search = req.query.search
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.name = {
            $regex: search,
            $options: "i",
        };
    }

    const skip = (page - 1) * limit;

    const [gurudwaras, total] = await Promise.all([
        Gurudwara.find(filter)
            .populate("createdBy", "fullName username")
            .populate("updatedBy", "fullName username")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Gurudwara.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                gurudwaras,
                pagination: {
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    limit,
                },
            },
            "Gurudwaras fetched successfully"
        )
    );
});

// Get Single Gurudwara - Admin
const getGurudwaraById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.gurudwaraId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Gurudwara ID");
    }

    const gurudwara = await Gurudwara.findById(req.params.gurudwaraId)
        .populate("createdBy", "fullName username")
        .populate("updatedBy", "fullName username");

    if (!gurudwara) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Gurudwara not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                gurudwara,
                "Gurudwara fetched successfully"
            )
        );
});

// Create Gurudwara
const createGurudwara = asyncHandler(async (req, res) => {
    const requestData = parseRequestBody(req.body);
    const validation = createGurudwaraSchema.safeParse(requestData);

    if (!validation.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid Gurudwara details",
            validation.error.issues
        );
    }

    const data = validation.data;

    const slug = data.slug
        ? await generateUniqueSlug(data.slug)
        : await generateUniqueSlug(data.name);

    const uploadedAssets = [];

    try {
        const coverFile = req.files?.coverImage?.[0];
        const galleryFiles = req.files?.images || [];

        const coverImage = await uploadImage(coverFile);

        if (coverImage) uploadedAssets.push(coverImage);

        const images = await uploadImages(galleryFiles);
        uploadedAssets.push(...images);

        const gurudwara = await Gurudwara.create({
            ...data,
            slug,
            location: data.location
                ? { ...data.location, type: "Point" }
                : undefined,
            coverImage,
            images,
            createdBy: req.user._id,
        });

        return res
            .status(HttpStatus.CREATED)
            .json(
                new ApiResponse(
                    HttpStatus.CREATED,
                    gurudwara,
                    "Gurudwara created successfully"
                )
            );
    } catch (error) {
        await cleanupCloudinaryImages(uploadedAssets);
        throw error;
    }
});

// Update Gurudwara
const updateGurudwara = asyncHandler(async (req, res) => {
    const { gurudwaraId } = req.params;

    if (!mongoose.isValidObjectId(gurudwaraId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Gurudwara ID");
    }

    const gurudwara = await Gurudwara.findById(gurudwaraId);

    if (!gurudwara) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Gurudwara not found");
    }

    const requestData = parseRequestBody(req.body);
    const validation = updateGurudwaraSchema.safeParse(requestData);

    if (!validation.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid Gurudwara details",
            validation.error.issues
        );
    }

    const data = validation.data;
    const uploadedAssets = [];

    const previousCoverImage = gurudwara.coverImage;

    try {
        if (data.name && data.name !== gurudwara.name) {
            data.slug = await generateUniqueSlug(data.name, gurudwaraId);
        } else if (data.slug && data.slug !== gurudwara.slug) {
            data.slug = await generateUniqueSlug(data.slug, gurudwaraId);
        }

        const coverFile = req.files?.coverImage?.[0];
        const galleryFiles = req.files?.images || [];

        if (coverFile) {
            const newCover = await uploadImage(coverFile);
            uploadedAssets.push(newCover);
            data.coverImage = newCover;
        }

        if (galleryFiles.length > 0) {
            const newImages = await uploadImages(galleryFiles);
            uploadedAssets.push(...newImages);

            data.images = [...gurudwara.images, ...newImages];
        }

        if (data.location) {
            data.location = {
                ...data.location,
                type: "Point",
            };
        }

        Object.assign(gurudwara, data);
        gurudwara.updatedBy = req.user._id;

        await gurudwara.save();

        if (coverFile && previousCoverImage?.publicId) {
            await deleteFromCloudinary(previousCoverImage.publicId);
        }

        return res
            .status(HttpStatus.OK)
            .json(
                new ApiResponse(
                    HttpStatus.OK,
                    gurudwara,
                    "Gurudwara updated successfully"
                )
            );
    } catch (error) {
        await cleanupCloudinaryImages(uploadedAssets);
        throw error;
    }
});

// Delete Gurudwara
const deleteGurudwara = asyncHandler(async (req, res) => {
    const { gurudwaraId } = req.params;

    if (!mongoose.isValidObjectId(gurudwaraId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Gurudwara ID");
    }

    const gurudwara = await Gurudwara.findById(gurudwaraId);

    if (!gurudwara) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Gurudwara not found");
    }

    const assets = [gurudwara.coverImage, ...(gurudwara.images || [])];

    await Gurudwara.findByIdAndDelete(gurudwaraId);
    await cleanupCloudinaryImages(assets);

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                null,
                "Gurudwara deleted successfully"
            )
        );
});

export {
    getPublishedGurudwaras,
    getPublishedGurudwaraBySlug,
    getAllGurudwaras,
    getGurudwaraById,
    createGurudwara,
    updateGurudwara,
    deleteGurudwara,
};
