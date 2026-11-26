import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import {
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// =========================================
// Login Rate Limiter
// =========================================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,

    standardHeaders: true,
    legacyHeaders: false,

    skipSuccessfulRequests: true,

    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message:
                "Too many login attempts. Please try again after 15 minutes.",
        });
    },
});

// =========================================
// Authentication Routes
// =========================================

// Admin Login
router.route("/login").post(loginLimiter, loginUser);

// Admin Logout
router.route("/logout").post(verifyJWT, logoutUser);

// Get Current Admin
router.route("/me").get(verifyJWT, getCurrentUser);

// Refresh Access Token
router.route("/refresh-token").post(refreshAccessToken);

export default router;
