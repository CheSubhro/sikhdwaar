import { Router } from "express";

import { getDashboardStats } from "../controllers/dashboard.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Admin Dashboard Access
router.use(verifyJWT, authorizeRoles("superadmin", "admin"));

// Dashboard Statistics
router.route("/").get(getDashboardStats);

export default router;
