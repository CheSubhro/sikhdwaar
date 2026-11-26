import { Router } from "express";

import {
    getPublishedGurudwaras,
    getPublishedGurudwaraBySlug,
    getAllGurudwaras,
    getGurudwaraById,
    createGurudwara,
    updateGurudwara,
    deleteGurudwara,
} from "../controllers/gurudwara.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public Routes
router.route("/").get(getPublishedGurudwaras);

router.route("/slug/:slug").get(getPublishedGurudwaraBySlug);

// Admin Routes - Super Admin and Admin only
router.use("/admin", verifyJWT, authorizeRoles("superadmin", "admin"));

router
    .route("/admin")
    .get(getAllGurudwaras)
    .post(
        upload.fields([
            { name: "coverImage", maxCount: 1 },
            { name: "images", maxCount: 10 },
        ]),
        createGurudwara
    );

router
    .route("/admin/:gurudwaraId")
    .get(getGurudwaraById)
    .patch(
        upload.fields([
            { name: "coverImage", maxCount: 1 },
            { name: "images", maxCount: 10 },
        ]),
        updateGurudwara
    )
    .delete(deleteGurudwara);

export default router;
