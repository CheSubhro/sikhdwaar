import { ApiError } from "../utils/ApiError.js";
import HttpStatus from "../utils/HttpStatus.js";

// =========================================
// Global Error Middleware
// =========================================

const errorMiddleware = (err, req, res, next) => {
    let error = err;

    // Convert unknown errors into ApiError
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

        const message = error.message || "Internal Server Error";

        error = new ApiError(statusCode, message, [], err.stack);
    }

    // Error Response
    const response = {
        success: false,
        message: error.message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV !== "production" && {
            stack: error.stack,
        }),
    };

    return res
        .status(error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR)
        .json(response);
};

export { errorMiddleware };
