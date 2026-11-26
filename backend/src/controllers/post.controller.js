import mongoose from "mongoose";

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import HttpStatus from "../utils/HttpStatus.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Post } from "../models/post.model.js";

import { createPostSchema, updatePostSchema } from "../utils/Validation.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/Cloudinary.js";

// Parse Multipart Form Data
const parseRequestBody = (body) => {
    const parsedBody = { ...body };

    const jsonFields = ["tags", "eventDetails", "seo"];

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
const generateUniqueSlug = async (title, excludeId = null) => {
    const baseSlug = title
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

        const existingPost = await Post.findOne(query);

        if (!existingPost) {
            return slug;
        }

        slug = `${baseSlug}-${counter++}`;
    }
};

// Validate MongoDB ObjectId
const validatePostId = (postId) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Post ID");
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

// Cleanup Cloudinary Images
const cleanupCloudinaryImages = async (images = []) => {
    for (const image of images) {
        if (image?.publicId) {
            await deleteFromCloudinary(image.publicId);
        }
    }
};

// Public: Get Published Posts
const getPublishedPosts = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const { search, type, category, featured } = req.query;

    const filter = { status: "published" };

    if (type && ["article", "news", "event"].includes(type)) {
        filter.type = type;
    }

    if (category) {
        filter.category = category;
    }

    if (featured === "true") {
        filter.isFeatured = true;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { excerpt: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
        ];
    }

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .select("-author -updatedAt")
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Post.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                posts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
            "Published posts fetched successfully"
        )
    );
});

// Public: Get Published Post By Slug
const getPublishedPostBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const post = await Post.findOne({
        slug,
        status: "published",
    }).select("-author -updatedAt");

    if (!post) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Post not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                post,
                "Post details fetched successfully"
            )
        );
});

// Admin: Get All Posts
const getAllPosts = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const { search, type, category, status } = req.query;

    const filter = {};

    if (type && ["article", "news", "event"].includes(type)) {
        filter.type = type;
    }

    if (category) {
        filter.category = category;
    }

    if (status && ["draft", "published"].includes(status)) {
        filter.status = status;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { excerpt: { $regex: search, $options: "i" } },
        ];
    }

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate("author", "fullName username")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Post.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                posts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
            "Posts fetched successfully"
        )
    );
});

// Admin: Get Post By ID
const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    validatePostId(postId);

    const post = await Post.findById(postId).populate(
        "author",
        "fullName username"
    );

    if (!post) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Post not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                post,
                "Post details fetched successfully"
            )
        );
});

// Admin: Create Post
const createPost = asyncHandler(async (req, res) => {
    const body = parseRequestBody(req.body);

    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid Post data",
            validation.error.issues
        );
    }

    const postData = validation.data;
    const uploadedAssets = [];

    try {
        postData.slug = await generateUniqueSlug(
            postData.slug || postData.title
        );

        // Upload Featured Image
        const featuredFile = req.files?.featuredImage?.[0];

        if (featuredFile) {
            const featuredImage = await uploadImage(featuredFile);

            uploadedAssets.push(featuredImage);
            postData.featuredImage = featuredImage;
        }

        // Upload Gallery Images
        const imageFiles = req.files?.images || [];

        if (imageFiles.length > 0) {
            const images = await uploadImages(imageFiles);

            uploadedAssets.push(...images);
            postData.images = images;
        }

        // Set Publish Date
        if (postData.status === "published" && !postData.publishedAt) {
            postData.publishedAt = new Date();
        }

        const post = await Post.create({
            ...postData,
            author: req.user._id,
        });

        return res
            .status(HttpStatus.CREATED)
            .json(
                new ApiResponse(
                    HttpStatus.CREATED,
                    post,
                    "Post created successfully"
                )
            );
    } catch (error) {
        await cleanupCloudinaryImages(uploadedAssets);

        if (error.code === 11000) {
            throw new ApiError(HttpStatus.CONFLICT, "Post slug already exists");
        }

        throw error;
    }
});

// Admin: Update Post
const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    validatePostId(postId);

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Post not found");
    }

    const body = parseRequestBody(req.body);

    const validation = updatePostSchema.safeParse(body);

    if (!validation.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid Post data",
            validation.error.issues
        );
    }

    const updateData = validation.data;
    const uploadedAssets = [];

    const previousFeaturedImage = post.featuredImage;

    try {
        // Update Slug
        if (updateData.title || updateData.slug) {
            updateData.slug = await generateUniqueSlug(
                updateData.slug || updateData.title || post.title,
                postId
            );
        }

        // Upload New Featured Image
        const featuredFile = req.files?.featuredImage?.[0];

        if (featuredFile) {
            const featuredImage = await uploadImage(featuredFile);

            uploadedAssets.push(featuredImage);
            updateData.featuredImage = featuredImage;
        }

        // Upload New Gallery Images
        const imageFiles = req.files?.images || [];

        if (imageFiles.length > 0) {
            const images = await uploadImages(imageFiles);

            uploadedAssets.push(...images);

            updateData.images = [...post.images, ...images];
        }

        // Update Publish Date
        if (updateData.status === "published" && post.status !== "published") {
            updateData.publishedAt = updateData.publishedAt || new Date();
        }

        if (updateData.status === "draft") {
            updateData.publishedAt = null;
        }

        Object.assign(post, updateData);

        await post.save();

        // Delete Previous Featured Image
        if (featuredFile && previousFeaturedImage?.publicId) {
            await deleteFromCloudinary(previousFeaturedImage.publicId);
        }

        return res
            .status(HttpStatus.OK)
            .json(
                new ApiResponse(
                    HttpStatus.OK,
                    post,
                    "Post updated successfully"
                )
            );
    } catch (error) {
        await cleanupCloudinaryImages(uploadedAssets);

        if (error.code === 11000) {
            throw new ApiError(HttpStatus.CONFLICT, "Post slug already exists");
        }

        throw error;
    }
});

// Admin: Delete Post
const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    validatePostId(postId);

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Post not found");
    }

    const imagesToDelete = [post.featuredImage, ...post.images];

    await Post.findByIdAndDelete(postId);

    await cleanupCloudinaryImages(imagesToDelete);

    return res
        .status(HttpStatus.OK)
        .json(new ApiResponse(HttpStatus.OK, {}, "Post deleted successfully"));
});

export {
    getPublishedPosts,
    getPublishedPostBySlug,
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};
