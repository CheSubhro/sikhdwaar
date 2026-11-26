import mongoose, { Schema } from "mongoose";

// Image Schema
const imageSchema = new Schema(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: { type: String, trim: true, default: "" },
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
            maxlength: 160,
            default: "",
        },
        keywords: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

// Post Schema
const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
            index: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        type: {
            type: String,
            enum: ["article", "news", "event"],
            required: true,
            index: true,
        },

        excerpt: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        content: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            trim: true,
            default: "",
            index: true,
        },

        tags: {
            type: [String],
            default: [],
        },

        featuredImage: {
            type: imageSchema,
            default: null,
        },

        images: {
            type: [imageSchema],
            default: [],
        },

        // Event-specific fields
        eventDetails: {
            startDate: { type: Date, default: null },
            endDate: { type: Date, default: null },
            location: { type: String, trim: true, default: "" },
            registrationUrl: { type: String, trim: true, default: "" },
        },

        // Author
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
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

        seo: {
            type: seoSchema,
            default: () => ({}),
        },
    },
    { timestamps: true }
);

// Text Search Index
postSchema.index({
    title: "text",
    excerpt: "text",
    content: "text",
    category: "text",
});

// Public Listing Index
postSchema.index({
    type: 1,
    status: 1,
    publishedAt: -1,
});

// Export Model
export const Post = mongoose.model("Post", postSchema);
