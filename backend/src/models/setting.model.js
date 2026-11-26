import mongoose, { Schema } from "mongoose";

// Cloudinary Image Schema
const imageSchema = new Schema(
    {
        url: {
            type: String,
            default: "",
        },
        publicId: {
            type: String,
            default: "",
        },
    },
    { _id: false }
);

// Contact Information Schema
const contactSchema = new Schema(
    {
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        alternatePhone: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { _id: false }
);

// Address Schema
const addressSchema = new Schema(
    {
        addressLine: {
            type: String,
            trim: true,
            default: "",
        },
        city: {
            type: String,
            trim: true,
            default: "",
        },
        district: {
            type: String,
            trim: true,
            default: "",
        },
        state: {
            type: String,
            trim: true,
            default: "",
        },
        pincode: {
            type: String,
            trim: true,
            default: "",
        },
        country: {
            type: String,
            trim: true,
            default: "India",
        },
    },
    { _id: false }
);

// Social Media Schema
const socialLinksSchema = new Schema(
    {
        facebook: {
            type: String,
            trim: true,
            default: "",
        },
        instagram: {
            type: String,
            trim: true,
            default: "",
        },
        youtube: {
            type: String,
            trim: true,
            default: "",
        },
        x: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { _id: false }
);

// SEO Schema
const seoSchema = new Schema(
    {
        metaTitle: {
            type: String,
            trim: true,
            maxlength: 70,
            default: "",
        },
        metaDescription: {
            type: String,
            trim: true,
            maxlength: 320,
            default: "",
        },
        keywords: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

// Website Settings Schema
const settingSchema = new Schema(
    {
        key: {
            type: String,
            default: "main",
            unique: true,
            immutable: true,
        },

        siteName: {
            type: String,
            trim: true,
            default: "SikhDwaar",
        },

        tagline: {
            type: String,
            trim: true,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },

        logo: {
            type: imageSchema,
            default: null,
        },

        favicon: {
            type: imageSchema,
            default: null,
        },

        contact: {
            type: contactSchema,
            default: () => ({}),
        },

        address: {
            type: addressSchema,
            default: () => ({}),
        },

        socialLinks: {
            type: socialLinksSchema,
            default: () => ({}),
        },

        seo: {
            type: seoSchema,
            default: () => ({}),
        },

        footerDescription: {
            type: String,
            default: "",
        },

        copyrightText: {
            type: String,
            trim: true,
            default: "",
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

export const Setting = mongoose.model("Setting", settingSchema);
