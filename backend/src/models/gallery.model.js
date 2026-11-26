import mongoose, { Schema } from "mongoose";

// Gallery Image Schema
const galleryImageSchema = new Schema(
    {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

// Gallery Schema
const gallerySchema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            default: "",
            maxlength: 200,
        },

        caption: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500,
        },

        description: {
            type: String,
            default: "",
        },

        image: {
            type: galleryImageSchema,
            required: true,
        },

        altText: {
            type: String,
            trim: true,
            default: "",
            maxlength: 250,
        },

        category: {
            type: String,
            trim: true,
            default: "General",
            index: true,
        },

        album: {
            type: String,
            trim: true,
            default: "",
            index: true,
        },

        tags: {
            type: [String],
            default: [],
        },

        displayOrder: {
            type: Number,
            default: 0,
            index: true,
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
            index: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },

        publishedAt: {
            type: Date,
            default: null,
        },

        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

// Text Search Index
gallerySchema.index({
    title: "text",
    caption: "text",
    description: "text",
    category: "text",
    album: "text",
});

// Public Gallery Index
gallerySchema.index({
    status: 1,
    category: 1,
    displayOrder: 1,
    createdAt: -1,
});

export const Gallery = mongoose.model("Gallery", gallerySchema);
