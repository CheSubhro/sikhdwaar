import { Router } from "express";

import {
    getPublishedGallery,
    getPublishedGalleryById,
    getAllGallery,
    getGalleryById,
    createGallery,
    updateGallery,
    deleteGallery,
} from "../controllers/gallery.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// =========================================
// Public Routes
// =========================================

// Get Published Gallery
router.route("/").get(getPublishedGallery);

// Get Published Gallery Image by ID
router.route("/:galleryId").get(getPublishedGalleryById);

// =========================================
// Admin Routes
// =========================================

router.use("/admin", verifyJWT, authorizeRoles("superadmin", "admin"));

// Get All Gallery & Create Gallery
router
    .route("/admin")
    .get(getAllGallery)
    .post(upload.single("image"), createGallery);

// Get, Update & Delete Gallery
router
    .route("/admin/:galleryId")
    .get(getGalleryById)
    .patch(upload.single("image"), updateGallery)
    .delete(deleteGallery);

export default router;
