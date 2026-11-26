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

// Family Details Schema
const familySchema = new Schema(
    {
        father: { type: String, trim: true, default: "" },
        mother: { type: String, trim: true, default: "" },
        spouse: { type: String, trim: true, default: "" },
        children: { type: [String], default: [] },
    },
    { _id: false }
);

// Important Events Schema
const eventSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        date: { type: String, trim: true, default: "" },
        description: { type: String, default: "" },
    },
    { _id: false }
);

// Guru Schema
const guruSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
            index: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        guruNumber: {
            type: Number,
            required: true,
            unique: true,
            min: 1,
            max: 10,
        },
        title: {
            type: String,
            trim: true,
            default: "",
        },
        shortDescription: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        biography: {
            type: String,
            default: "",
        },
        teachings: {
            type: [String],
            default: [],
        },
        contributions: {
            type: [String],
            default: [],
        },
        birthDate: {
            type: String,
            default: "",
        },
        deathDate: {
            type: String,
            default: "",
        },
        birthPlace: {
            type: String,
            trim: true,
            default: "",
        },
        family: {
            type: familySchema,
            default: () => ({}),
        },
        gurushipStartDate: {
            type: String,
            default: "",
        },
        gurushipEndDate: {
            type: String,
            default: "",
        },
        importantEvents: {
            type: [eventSchema],
            default: [],
        },
        coverImage: {
            type: imageSchema,
            default: null,
        },
        images: {
            type: [imageSchema],
            default: [],
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
        createdBy: {
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

// Indexes
guruSchema.index({
    name: "text",
    shortDescription: "text",
    biography: "text",
});

guruSchema.index({ guruNumber: 1, status: 1 });

export const Guru = mongoose.model("Guru", guruSchema);
