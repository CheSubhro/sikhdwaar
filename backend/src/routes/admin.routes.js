import { Router } from "express";

import {
    getAdminUsers,
    createAdminUser,
    updateAdminUser,
    updateAdminUserRole,
    updateAdminUserStatus,
    deleteAdminUser,
} from "../controllers/admin.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require Super Admin authentication
router.use(verifyJWT, authorizeRoles("superadmin"));

// Admin User Management
router.route("/users").get(getAdminUsers).post(createAdminUser);

// Update Admin Details / Delete Admin
router.route("/users/:userId").patch(updateAdminUser).delete(deleteAdminUser);

// Update Admin Role
router.route("/users/:userId/role").patch(updateAdminUserRole);

// Activate / Deactivate Admin
router.route("/users/:userId/status").patch(updateAdminUserStatus);

export default router;
