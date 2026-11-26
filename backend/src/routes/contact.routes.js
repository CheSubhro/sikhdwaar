import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import {
    createContact,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
} from "../controllers/contact.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// =========================================
// Public Contact Rate Limiter
// =========================================

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 Hour
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message:
            "Too many contact submissions. Please try again after some time.",
    },
});

// =========================================
// Public Routes
// =========================================

router.route("/").post(contactLimiter, createContact);

// =========================================
// Admin Routes
// =========================================

router.use("/admin", verifyJWT, authorizeRoles("superadmin", "admin"));

// Get All Contacts
router.route("/admin").get(getAllContacts);

// Get, Update Status & Delete Contact
router
    .route("/admin/:contactId")
    .get(getContactById)
    .patch(updateContactStatus)
    .delete(deleteContact);

export default router;
