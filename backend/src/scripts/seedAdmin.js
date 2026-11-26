import dotenv from "dotenv";
import mongoose from "mongoose";

import { User } from "../models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        // Check MongoDB configuration
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env");
        }

        // Get initial admin details from environment
        const fullName = process.env.ADMIN_NAME?.trim();
        const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;

        if (!fullName || !username || !email || !password) {
            throw new Error(
                "Please provide ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env"
            );
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully");

        // Check existing admin
        const existedUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (existedUser) {
            existedUser.password = password;
            existedUser.isActive = true;

            await existedUser.save();

            console.log("Existing Admin password updated successfully!");
            console.log("Email:", existedUser.email);

            return;
        }

        // Create initial Super Admin
        const admin = await User.create({
            fullName,
            username,
            email,
            password,
            role: "superadmin",
            isActive: true,
            avatar: null,
            coverImage: null,
        });

        console.log("Super Admin created successfully!");
        console.log("Admin ID:", admin._id.toString());
        console.log("Username:", admin.username);
        console.log("Email:", admin.email);
    } catch (error) {
        console.error("Admin seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log("MongoDB disconnected");
        }
    }
};

seedAdmin();
