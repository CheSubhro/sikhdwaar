import mongoose from "mongoose";

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import HttpStatus from "../utils/HttpStatus.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/user.model.js";
import { registerUserSchema, updateUserSchema } from "../utils/Validation.js";

// Allowed roles for Admin Management
const allowedRoles = ["admin", "editor"];

// Escape search text before using it in a regular expression
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Get All Admin Users
const getAdminUsers = asyncHandler(async (req, res) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
        Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
        100
    );

    const filter = {
        role: { $in: allowedRoles },
    };

    if (req.query.role) {
        if (!allowedRoles.includes(req.query.role)) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid admin role");
        }

        filter.role = req.query.role;
    }

    if (req.query.search?.trim()) {
        const search = escapeRegex(req.query.search.trim());

        filter.$or = [
            { fullName: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        User.find(filter)
            .select("-password -refreshToken")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        User.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            {
                users,
                pagination: {
                    totalUsers,
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    limit,
                },
            },
            "Admin users fetched successfully"
        )
    );
});

// Create Admin or Editor
const createAdminUser = asyncHandler(async (req, res) => {
    const validation = registerUserSchema.safeParse(req.body);

    if (!validation.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid admin details",
            validation.error.issues
        );
    }

    const { fullName, username, email, password } = validation.data;
    const { role } = req.body;

    if (!allowedRoles.includes(role)) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Role must be either admin or editor"
        );
    }

    // Check duplicate username or email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(
            HttpStatus.CONFLICT,
            "Username or email already exists"
        );
    }

    // Create Admin User
    const user = await User.create({
        fullName,
        username,
        email,
        password,
        role,
        isActive: true,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(HttpStatus.CREATED)
        .json(
            new ApiResponse(
                HttpStatus.CREATED,
                createdUser,
                "Admin user created successfully"
            )
        );
});

// Update Admin Details
const updateAdminUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const validation = updateUserSchema.safeParse(req.body);

    if (!validation.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid admin details",
            validation.error.issues
        );
    }

    const updateData = validation.data;

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Please provide at least one field to update"
        );
    }

    const user = await User.findOne({
        _id: userId,
        role: { $in: allowedRoles },
    });

    if (!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Admin user not found");
    }

    // Check duplicate username or email
    const duplicateConditions = [];

    if (updateData.username) {
        duplicateConditions.push({ username: updateData.username });
    }

    if (updateData.email) {
        duplicateConditions.push({ email: updateData.email });
    }

    if (duplicateConditions.length > 0) {
        const existedUser = await User.findOne({
            _id: { $ne: userId },
            $or: duplicateConditions,
        });

        if (existedUser) {
            throw new ApiError(
                HttpStatus.CONFLICT,
                "Username or email already exists"
            );
        }
    }

    Object.assign(user, updateData);
    await user.save();

    const updatedUser = await User.findById(userId).select(
        "-password -refreshToken"
    );

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                updatedUser,
                "Admin user updated successfully"
            )
        );
});

// Change Admin Role
const updateAdminUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid user ID");
    }

    if (!allowedRoles.includes(role)) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Role must be either admin or editor"
        );
    }

    const user = await User.findOne({
        _id: userId,
        role: { $in: allowedRoles },
    });

    if (!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Admin user not found");
    }

    user.role = role;
    await user.save();

    const updatedUser = await User.findById(userId).select(
        "-password -refreshToken"
    );

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                updatedUser,
                "Admin role updated successfully"
            )
        );
});

// Activate or Deactivate Admin
const updateAdminUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid user ID");
    }

    if (typeof isActive !== "boolean") {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "isActive must be true or false"
        );
    }

    const user = await User.findOne({
        _id: userId,
        role: { $in: allowedRoles },
    });

    if (!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Admin user not found");
    }

    user.isActive = isActive;
    await user.save();

    const updatedUser = await User.findById(userId).select(
        "-password -refreshToken"
    );

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                updatedUser,
                isActive
                    ? "Admin account activated successfully"
                    : "Admin account deactivated successfully"
            )
        );
});

// Delete Admin User
const deleteAdminUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const user = await User.findOne({
        _id: userId,
        role: { $in: allowedRoles },
    });

    if (!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Admin user not found");
    }

    await User.findByIdAndDelete(userId);

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                null,
                "Admin user deleted successfully"
            )
        );
});

export {
    getAdminUsers,
    createAdminUser,
    updateAdminUser,
    updateAdminUserRole,
    updateAdminUserStatus,
    deleteAdminUser,
};
