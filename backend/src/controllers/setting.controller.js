import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import HttpStatus from "../utils/HttpStatus.js";

import { Setting } from "../models/setting.model.js";

import { updateSettingSchema } from "../utils/Validation.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/Cloudinary.js";

// =========================================
// Get or Create Main Website Settings
// =========================================

const getOrCreateSettings = async () => {
    let settings = await Setting.findOne({ key: "main" });

    if (!settings) {
        settings = await Setting.create({
            key: "main",
        });
    }

    return settings;
};

// =========================================
// Upload Setting Image
// =========================================

const uploadSettingImage = async (file) => {
    if (!file) return null;

    const response = await uploadOnCloudinary(file.path);

    if (!response) {
        throw new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Image upload failed"
        );
    }

    return {
        url: response.secure_url,
        publicId: response.public_id,
    };
};

// =========================================
// Delete Old Setting Image
// =========================================

const deleteOldSettingImage = async (image) => {
    if (!image?.publicId) return;

    await deleteFromCloudinary(image.publicId);
};

// =========================================
// Public: Get Website Settings
// =========================================

const getPublicSettings = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();

    const publicSettings = {
        siteName: settings.siteName,
        tagline: settings.tagline,
        description: settings.description,

        logo: settings.logo,
        favicon: settings.favicon,

        contact: settings.contact,
        address: settings.address,

        socialLinks: settings.socialLinks,

        seo: settings.seo,

        footerDescription: settings.footerDescription,
        copyrightText: settings.copyrightText,
    };

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                publicSettings,
                "Website settings fetched successfully"
            )
        );
});

// =========================================
// Admin: Get Website Settings
// =========================================

const getAdminSettings = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                settings,
                "Admin settings fetched successfully"
            )
        );
});

// =========================================
// Admin: Update Website Settings
// =========================================

const updateSettings = asyncHandler(async (req, res) => {
    // Validate request body
    const validationResult = updateSettingSchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid website settings data",
            validationResult.error.issues
        );
    }

    const updateData = validationResult.data;

    // Get existing settings
    const settings = await getOrCreateSettings();

    // Store previous images for cleanup after successful save
    const oldLogo = settings.logo?.publicId ? settings.logo.toObject() : null;

    const oldFavicon = settings.favicon?.publicId
        ? settings.favicon.toObject()
        : null;

    // Upload new Logo if provided
    const logoFile = req.files?.logo?.[0];

    if (logoFile) {
        const uploadedLogo = await uploadSettingImage(logoFile);

        if (uploadedLogo) {
            settings.logo = uploadedLogo;
        }
    }

    // Upload new Favicon if provided
    const faviconFile = req.files?.favicon?.[0];

    if (faviconFile) {
        const uploadedFavicon = await uploadSettingImage(faviconFile);

        if (uploadedFavicon) {
            settings.favicon = uploadedFavicon;
        }
    }

    // Update normal fields
    Object.entries(updateData).forEach(([key, value]) => {
        // Update nested objects without losing existing fields
        if (["contact", "address", "socialLinks", "seo"].includes(key)) {
            const existingValue = settings[key]?.toObject
                ? settings[key].toObject()
                : settings[key] || {};

            settings.set(key, {
                ...existingValue,
                ...value,
            });
        } else {
            settings[key] = value;
        }
    });

    // Track updated admin
    settings.updatedBy = req.user._id;

    // Save settings
    await settings.save();

    // Delete old Logo after successful save
    if (
        logoFile &&
        oldLogo?.publicId &&
        oldLogo.publicId !== settings.logo?.publicId
    ) {
        await deleteOldSettingImage(oldLogo);
    }

    // Delete old Favicon after successful save
    if (
        faviconFile &&
        oldFavicon?.publicId &&
        oldFavicon.publicId !== settings.favicon?.publicId
    ) {
        await deleteOldSettingImage(oldFavicon);
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                settings,
                "Website settings updated successfully"
            )
        );
});

// =========================================
// Export Controllers
// =========================================

export { getPublicSettings, getAdminSettings, updateSettings };
