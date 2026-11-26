

import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import HttpStatus from "../utils/HttpStatus.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/user.model.js";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../constants.js";

import { loginUserSchema } from "../utils/Validation.js";

// Generate Access Token and Refresh Token
const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Admin user not found");
    }

    const accessToken = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
        }
    );

    const refreshToken = jwt.sign(
        {
            _id: user._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
        }
    );

    // Save refresh token in database
    user.refreshToken = refreshToken;

    await user.save({
        validateBeforeSave: false,
    });

    return {
        accessToken,
        refreshToken,
    };
};

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// Admin Login Controller
const loginUser = asyncHandler(async (req, res) => {
    // Get login details
    const validation = loginUserSchema.safeParse(req.body);

    if (!validation.success) {
        throw new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid login details",
            validation.error.issues
        );
    }

    const { email, password } = validation.data;

    // Find admin by email
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(
            HttpStatus.UNAUTHORIZED,
            "Invalid email or password"
        );
    }

    // Check account status
    if (!user.isActive) {
        throw new ApiError(
            HttpStatus.FORBIDDEN,
            "Your admin account is inactive"
        );
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(
            HttpStatus.UNAUTHORIZED,
            "Invalid email or password"
        );
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    // Get admin details without sensitive fields
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Set authentication cookies
    return res
        .status(HttpStatus.OK)
        .cookie(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions)
        .cookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                {
                    user: loggedInUser,
                    accessToken,
                },
                "Admin login successful"
            )
        );
});

// Admin Logout Controller
const logoutUser = asyncHandler(async (req, res) => {
    // Remove refresh token from database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null,
            },
        },
        {
            new: true,
        }
    );

    // Clear authentication cookies
    return res
        .status(HttpStatus.OK)
        .clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions)
        .clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions)
        .json(new ApiResponse(HttpStatus.OK, null, "Admin logout successful"));
});

// Get Current Logged-in Admin
const getCurrentUser = asyncHandler(async (req, res) => {
    // Get authenticated admin details
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Admin user not found");
    }

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                user,
                "Admin profile fetched successfully"
            )
        );
});

// Refresh Access Token Controller
const refreshAccessToken = asyncHandler(async (req, res) => {

    // Get refresh token from HTTP-only cookie
    const incomingRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!incomingRefreshToken) {
        throw new ApiError(
            HttpStatus.UNAUTHORIZED,
            "Refresh token is required. Please login again."
        );
    }

    // Verify refresh token
    let decodedToken;

    try {
        decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch (error) {
        throw new ApiError(
            HttpStatus.UNAUTHORIZED,
            "Invalid or expired refresh token. Please login again."
        );
    }

    // Find admin and verify stored refresh token
    const user = await User.findById(decodedToken._id);

    if (!user || !user.isActive) {
        throw new ApiError(
            HttpStatus.UNAUTHORIZED,
            "Admin account not found or inactive"
        );
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(
            HttpStatus.UNAUTHORIZED,
            "Refresh token is invalid or already used. Please login again."
        );
    }

    // Generate new Access Token and Refresh Token
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    // Set new authentication cookies
    return res
        .status(HttpStatus.OK)
        .cookie(
            ACCESS_TOKEN_COOKIE,
            accessToken,
            cookieOptions
        )
        .cookie(
            REFRESH_TOKEN_COOKIE,
            refreshToken,
            cookieOptions
        )
        .json(
            new ApiResponse(
                HttpStatus.OK,
                {
                    accessToken
                },
                "Access token refreshed successfully"
            )
        );

});


export { loginUser, logoutUser, getCurrentUser, refreshAccessToken };
