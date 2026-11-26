import { Router } from "express";

import {
    getPublishedGurus,
    getPublishedGuruBySlug,
    getAllGurus,
    getGuruById,
    createGuru,
    updateGuru,
    deleteGuru,
} from "../controllers/guru.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public Routes
router.route("/").get(getPublishedGurus);

router.route("/slug/:slug").get(getPublishedGuruBySlug);

// Admin Routes
router.use("/admin", verifyJWT, authorizeRoles("superadmin", "admin"));

// Get All Gurus & Create Guru
router
    .route("/admin")
    .get(getAllGurus)
    .post(
        upload.fields([
            { name: "coverImage", maxCount: 1 },
            { name: "images", maxCount: 10 },
        ]),
        createGuru
    );

// Get, Update & Delete Guru
router
    .route("/admin/:guruId")
    .get(getGuruById)
    .patch(
        upload.fields([
            { name: "coverImage", maxCount: 1 },
            { name: "images", maxCount: 10 },
        ]),
        updateGuru
    )
    .delete(deleteGuru);

export default router;
