

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

// Define the schema for the admin user
const userSchema = new Schema(
    {
        // Admin username
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        // Admin email
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // Admin full name
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        // Optional avatar image
        avatar: {
            type: String,
            default: null
        },

        // Optional cover image
        coverImage: {
            type: String,
            default: null
        },

        // Hashed password
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8
        },

        // Admin role
        role: {
            type: String,
            enum: ["superadmin", "admin", "editor"],
            default: "admin"
        },

        // Account status
        isActive: {
            type: Boolean,
            default: true
        },

        // Refresh token
        refreshToken: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Create and export the User model
export const User = mongoose.model("User", userSchema);
