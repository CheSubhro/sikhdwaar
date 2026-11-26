import { Router } from "express";

import {
    getPublishedPosts,
    getPublishedPostBySlug,
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
} from "../controllers/post.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public Routes
router.route("/").get(getPublishedPosts);

router.route("/slug/:slug").get(getPublishedPostBySlug);

// Admin Routes
router.use("/admin", verifyJWT, authorizeRoles("superadmin", "admin"));

// Get All Posts & Create Post
router
    .route("/admin")
    .get(getAllPosts)
    .post(
        upload.fields([
            { name: "featuredImage", maxCount: 1 },
            { name: "images", maxCount: 10 },
        ]),
        createPost
    );

// Get, Update & Delete Post
router
    .route("/admin/:postId")
    .get(getPostById)
    .patch(
        upload.fields([
            { name: "featuredImage", maxCount: 1 },
            { name: "images", maxCount: 10 },
        ]),
        updatePost
    )
    .delete(deletePost);

export default router;
