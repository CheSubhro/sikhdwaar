import mongoose, { Schema } from "mongoose";

// Contact Schema
const contactSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        status: {
            type: String,
            enum: ["unread", "read", "replied"],
            default: "unread",
            index: true,
        },

        readAt: {
            type: Date,
            default: null,
        },

        repliedAt: {
            type: Date,
            default: null,
        },

        ipAddress: {
            type: String,
            default: "",
            select: false,
        },

        userAgent: {
            type: String,
            default: "",
            select: false,
        },
    },
    { timestamps: true }
);

// Search Index
contactSchema.index({
    name: "text",
    email: "text",
    subject: "text",
    message: "text",
});

// Admin Listing Index
contactSchema.index({
    status: 1,
    createdAt: -1,
});

export const Contact = mongoose.model("Contact", contactSchema);
