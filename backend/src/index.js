import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

// =========================================
// Start Server
// =========================================

const startServer = async () => {
    let server;

    try {
        // Import Modules After Environment Configuration
        const [{ default: connectDB }, { app }] = await Promise.all([
            import("./db/index.js"),
            import("./app.js"),
        ]);

        // Connect MongoDB
        await connectDB();

        // Server Configuration
        const PORT = process.env.PORT || 8000;

        // Start Express Server
        server = app.listen(PORT, () => {
            console.log(`⚙️ Server is running at port : ${PORT}`);
        });

        // =========================================
        // Graceful Shutdown
        // =========================================

        let isShuttingDown = false;

        const shutdownServer = async (signal) => {
            if (isShuttingDown) return;

            isShuttingDown = true;

            console.log(`\n${signal} received. Closing server...`);

            server.close(async () => {
                console.log("HTTP Server closed.");

                try {
                    const mongoose = await import("mongoose");

                    await mongoose.default.connection.close();

                    console.log("MongoDB connection closed.");

                    process.exit(0);
                } catch (error) {
                    console.error("Error closing MongoDB:", error.message);

                    process.exit(1);
                }
            });
        };

        process.on("SIGTERM", () => shutdownServer("SIGTERM"));
        process.on("SIGINT", () => shutdownServer("SIGINT"));

        // =========================================
        // Server Error Handling
        // =========================================

        server.on("error", (error) => {
            console.error("Server error:", error.message);
            process.exit(1);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);

        if (server) {
            server.close();
        }

        process.exit(1);
    }
};

// Start Application
startServer();
