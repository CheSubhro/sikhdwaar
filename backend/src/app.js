
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import adminRouter from "./routes/admin.routes.js"
import gurudwaraRouter from "./routes/gurudwara.routes.js"
import guruRouter from "./routes/guru.routes.js";
import postRouter from "./routes/post.routes.js";
import galleryRouter from "./routes/gallery.routes.js";
import contactRouter from "./routes/contact.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

//routes declaration
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/gurudwaras", gurudwaraRouter);
app.use("/api/v1/gurus", guruRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/gallery", galleryRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/dashboard", dashboardRouter);


export { app }
