

import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import HttpStatus from "../utils/HttpStatus.js";

import { User } from "../models/user.model.js";
import { ACCESS_TOKEN_COOKIE } from "../constants.js";

// Verify Admin Access Token
const verifyJWT = asyncHandler(async (req, res, next) => {
    // Get token from cookie or Authorization header
    const token =
        req.cookies?.[ACCESS_TOKEN_COOKIE] ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(
            HttpStatus.UNAUTHORIZED,
            "Unauthorized request. Please login first."
        );
    }

    // Verify JWT token
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(
            HttpStatus.UNAUTHORIZED,
            "Invalid or expired access token"
        );
    }

    // Find admin user
    const user = await User.findById(decodedToken._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Admin user not found");
    }

    // Check account status
    if (!user.isActive) {
        throw new ApiError(
            HttpStatus.FORBIDDEN,
            "Your admin account is inactive"
        );
    }

    // Attach admin details to request
    req.user = user;

    next();
});

// Check Admin Role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(
                new ApiError(HttpStatus.UNAUTHORIZED, "Authentication required")
            );
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to perform this action"
                )
            );
        }

        next();
    };
};

export { verifyJWT, authorizeRoles };
