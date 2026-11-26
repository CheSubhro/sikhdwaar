

import { z } from "zod";

// Admin registration validation
export const registerUserSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters")
        .max(100, "Full name cannot exceed 100 characters"),

    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores"
        )
        .transform((value) => value.toLowerCase()),

    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .transform((value) => value.toLowerCase()),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password cannot exceed 64 characters"),
});

// Admin login validation
export const loginUserSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .transform((value) => value.toLowerCase()),

    password: z.string().min(1, "Password is required"),
});

// Update admin profile validation
export const updateUserSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters")
        .max(100, "Full name cannot exceed 100 characters")
        .optional(),

    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores"
        )
        .transform((value) => value.toLowerCase())
        .optional(),

    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .transform((value) => value.toLowerCase())
        .optional(),
});

// Change password validation
export const changePasswordSchema = z.object({
        currentPassword: z.string().min(1, "Current password is required"),

        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters")
            .max(64, "New password cannot exceed 64 characters"),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });

// Gurudwara Management Validation

const addressSchema = z.object({
    addressLine: z.string().trim().optional(),
    village: z.string().trim().optional(),
    city: z.string().trim().optional(),
    district: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
});

const gurudwaraContactSchema = z.object({
    phone: z.string().trim().optional(),
    email: z.string().trim().email().optional().or(z.literal("")),
    website: z.string().trim().optional(),
});

const gurudwaraLocationSchema = z.object({
    coordinates: z.array(z.number()).length(2).refine(
        ([longitude, latitude]) =>
            longitude >= -180 &&
            longitude <= 180 &&
            latitude >= -90 &&
            latitude <= 90,
        "Invalid longitude or latitude"
    ),
});

const visitingHourSchema = z.object({
    day: z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    isClosed: z.boolean().optional(),
});

export const createGurudwaraSchema = z.object({
    name: z.string().trim().min(3).max(150),
    slug: z.string().trim().optional(),
    shortDescription: z.string().trim().max(500).optional(),
    description: z.string().optional(),
    history: z.string().optional(),
    religiousSignificance: z.string().optional(),
    architecture: z.string().optional(),
    address: addressSchema.optional(),
    contact: gurudwaraContactSchema.optional(),
    location: gurudwaraLocationSchema.optional(),
    visitingHours: z.array(visitingHourSchema).optional(),
    facilities: z.array(z.string().trim()).optional(),
    status: z.enum(["draft", "published"]).optional(),
    isFeatured: z.boolean().optional(),
});

export const updateGurudwaraSchema = createGurudwaraSchema
    .omit({ name: true })
    .extend({
        name: z.string().trim().min(3).max(150).optional(),
    })
    .partial();    