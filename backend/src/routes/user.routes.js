
import { Router } from "express";

import {
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Admin Login - Public Route
router.route("/login").post(loginUser);

// Admin Logout - Protected Route
router.route("/logout").post(verifyJWT, logoutUser);

// Get Current Admin - Protected Route
router.route("/me").get(verifyJWT, getCurrentUser);

// Refresh Access Token - Public Route
router.route("/refresh-token").post(refreshAccessToken);

export default router;
