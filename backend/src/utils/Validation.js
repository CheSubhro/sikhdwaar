

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
export const changePasswordSchema = z
    .object({
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
