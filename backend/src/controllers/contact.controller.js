import mongoose from "mongoose";

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import HttpStatus from "../utils/HttpStatus.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Contact } from "../models/contact.model.js";

import {
    createContactSchema,
    updateContactStatusSchema,
} from "../utils/Validation.js";

// Escape Regular Expression
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Validate Contact ID
const validateContactId = (contactId) => {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Contact ID");
    }
};

// =========================================
// Public: Submit Contact Form
// =========================================
const createContact = asyncHandler(async (req, res) => {
    // Validate request body
    const validationResult = createContactSchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Contact validation failed",
            validationResult.error.issues
        );
    }

    const contactData = validationResult.data;

    // Create Contact
    const contact = await Contact.create({
        ...contactData,
        status: "unread",
        ipAddress: req.ip || "",
        userAgent: req.get("user-agent") || "",
    });

    return res.status(HttpStatus.CREATED).json(
        new ApiResponse(
            HttpStatus.CREATED,
            {
                contactId: contact._id,
            },
            "Your message has been submitted successfully"
        )
    );
});

// =========================================
// Admin: Get All Contacts
// =========================================
const getAllContacts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);

    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const filter = {};

    // Status Filter
    if (status) {
        if (!["unread", "read", "replied"].includes(status)) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Invalid contact status"
            );
        }

        filter.status = status;
    }

    // Search Filter
    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");

        filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { subject: searchRegex },
            { message: searchRegex },
        ];
    }

    const [contacts, total, unreadCount] = await Promise.all([
        Contact.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber),

        Contact.countDocuments(filter),

        Contact.countDocuments({ status: "unread" }),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                contacts,
                unreadCount,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber),
                },
            },
            "Contacts fetched successfully"
        )
    );
});

// =========================================
// Admin: Get Contact by ID
// =========================================
const getContactById = asyncHandler(async (req, res) => {
    const { contactId } = req.params;

    validateContactId(contactId);

    const contact = await Contact.findById(contactId);

    if (!contact) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Contact not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                contact,
                "Contact details fetched successfully"
            )
        );
});

// =========================================
// Admin: Update Contact Status
// =========================================
const updateContactStatus = asyncHandler(async (req, res) => {
    const { contactId } = req.params;

    validateContactId(contactId);

    // Validate status
    const validationResult = updateContactStatusSchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Contact status validation failed",
            validationResult.error.issues
        );
    }

    const { status } = validationResult.data;

    const contact = await Contact.findById(contactId);

    if (!contact) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Contact not found");
    }

    // Update status timestamps
    if (status === "unread") {
        contact.readAt = null;
        contact.repliedAt = null;
    }

    if (status === "read") {
        contact.readAt = contact.readAt || new Date();
        contact.repliedAt = null;
    }

    if (status === "replied") {
        contact.readAt = contact.readAt || new Date();
        contact.repliedAt = contact.repliedAt || new Date();
    }

    contact.status = status;

    await contact.save();

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                contact,
                "Contact status updated successfully"
            )
        );
});

// =========================================
// Admin: Delete Contact
// =========================================
const deleteContact = asyncHandler(async (req, res) => {
    const { contactId } = req.params;

    validateContactId(contactId);

    const contact = await Contact.findById(contactId);

    if (!contact) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Contact not found");
    }

    await Contact.findByIdAndDelete(contactId);

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(HttpStatus.OK, {}, "Contact deleted successfully")
        );
});

export {
    createContact,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
};
