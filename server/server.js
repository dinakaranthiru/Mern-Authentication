import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoute from "./routes/authRoute.js";
import userRouter from "./routes/userRoutes.js";

const app = express(); //Creates an Express app. This is your backend server.

const port = process.env.PORT || 4000; //Picks the port number: From .env if set (like 5000) Or uses 4000 by default

connectDB(); //Connects your app to MongoDB by calling the connectDB() function you wrote earlier.
const cors = require("cors");
app.use(
  cors({
    origin: "https://mern-authentication-pied.vercel.app",
    credentials: true, // if using cookies
  })
); //Allows cross-origin requests and also lets cookies work between your frontend and backend (important for authentication).

app.use(express.json()); //Tells Express to accept JSON data in incoming requests (like from a frontend form).

app.use(cookieParser()); // Tells Express to handle cookies in requests and responses.
app.get("/", (req, res) => res.send("API Working")); //Creates a test route: When someone visits /, it responds with "API Working".
app.use("/api/auth", authRoute);
app.use("/api/user", userRouter);

app.listen(port, () => console.log(`Server Started on PORT: ${port}`)); //Starts the server, and shows a message.
