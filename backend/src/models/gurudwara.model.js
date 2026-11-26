import mongoose, { Schema } from "mongoose";

// Address Schema
const addressSchema = new Schema(
    {
        addressLine: {
            type: String,
            trim: true,
            default: "",
        },
        village: {
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
        country: {
            type: String,
            trim: true,
            default: "India",
        },
        pincode: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { _id: false }
);

// Image Schema
const imageSchema = new Schema(
    {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
        altText: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { _id: false }
);

// Visiting Hours Schema
const visitingHoursSchema = new Schema(
    {
        day: {
            type: String,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ],
            required: true,
        },
        openingTime: {
            type: String,
            default: "",
        },
        closingTime: {
            type: String,
            default: "",
        },
        isClosed: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

// Gurudwara Schema
const gurudwaraSchema = new Schema(
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
        shortDescription: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        history: {
            type: String,
            default: "",
        },
        religiousSignificance: {
            type: String,
            default: "",
        },
        architecture: {
            type: String,
            default: "",
        },
        address: {
            type: addressSchema,
            default: () => ({}),
        },
        contact: {
            phone: {
                type: String,
                trim: true,
                default: "",
            },
            email: {
                type: String,
                trim: true,
                lowercase: true,
                default: "",
            },
            website: {
                type: String,
                trim: true,
                default: "",
            },
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
            },
            coordinates: {
                type: [Number],
                validate: {
                    validator: (value) =>
                        value.length === 2 &&
                        value[0] >= -180 &&
                        value[0] <= 180 &&
                        value[1] >= -90 &&
                        value[1] <= 90,
                    message: "Coordinates must be [longitude, latitude]",
                },
            },
        },
        visitingHours: {
            type: [visitingHoursSchema],
            default: [],
        },
        facilities: {
            type: [String],
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

// Geospatial index
gurudwaraSchema.index({ location: "2dsphere" });

// Search indexes
gurudwaraSchema.index({
    name: "text",
    shortDescription: "text",
    description: "text",
    "address.city": "text",
    "address.district": "text",
});

export const Gurudwara = mongoose.model("Gurudwara", gurudwaraSchema);
