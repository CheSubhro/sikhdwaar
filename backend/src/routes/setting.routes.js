import { Router } from "express";

import {
    getPublicSettings,
    getAdminSettings,
    updateSettings,
} from "../controllers/setting.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// =========================================
// Public Routes
// =========================================

// Get Public Website Settings
router.route("/").get(getPublicSettings);

// =========================================
// Admin Routes
// =========================================

router.use("/admin", verifyJWT, authorizeRoles("superadmin", "admin"));

// Get Admin Website Settings
router
    .route("/admin")
    .get(getAdminSettings)
    .patch(
        upload.fields([
            { name: "logo", maxCount: 1 },
            { name: "favicon", maxCount: 1 },
        ]),
        updateSettings
    );

export default router;
