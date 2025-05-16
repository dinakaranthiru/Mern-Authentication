import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoute from "./routes/authRoute.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// ✅ CORS Configuration for localhost and production
const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-authentication-pied.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true // 🔒 Needed to send/receive cookies
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Debug logging (optional, helps during development)
app.use((req, res, next) => {
  console.log("🔍 Request Origin:", req.headers.origin);
  next();
});

// Routes
app.get("/", (req, res) => res.send("✅ API Working"));
app.use("/api/auth", authRoute);
app.use("/api/user", userRouter);

// Start server
app.listen(port, () => console.log(`🚀 Server Started on PORT: ${port}`));
