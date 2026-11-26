import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import { ApiError } from "./utils/ApiError.js";
import HttpStatus from "./utils/HttpStatus.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

// Routes Import
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import gurudwaraRouter from "./routes/gurudwara.routes.js";
import guruRouter from "./routes/guru.routes.js";
import postRouter from "./routes/post.routes.js";
import galleryRouter from "./routes/gallery.routes.js";
import contactRouter from "./routes/contact.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import settingRouter from "./routes/setting.routes.js";

const app = express();

// =========================================
// Security Middleware
// =========================================

app.use(helmet());

const allowedOrigins =
    process.env.CORS_ORIGIN?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean) || [];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(null, false);
        },
        credentials: true,
    })
);

// =========================================
// Request Logging
// =========================================

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// =========================================
// Body Parser
// =========================================

app.use(express.json({ limit: "16kb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);

app.use(express.static("public"));

app.use(cookieParser());

// =========================================
// Routes Declaration
// =========================================

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/gurudwaras", gurudwaraRouter);
app.use("/api/v1/gurus", guruRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/gallery", galleryRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/settings", settingRouter);

// =========================================
// 404 Not Found Handler
// =========================================

app.use((req, res, next) => {
    next(
        new ApiError(
            HttpStatus.NOT_FOUND,
            `Route not found: ${req.method} ${req.originalUrl}`
        )
    );
});

// =========================================
// Global Error Handler
// =========================================

app.use(errorMiddleware);

export { app };
