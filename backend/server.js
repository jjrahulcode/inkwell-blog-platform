// Main entry point for the Blogging Platform backend

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Configure CORS so the frontend (Netlify) can talk to this backend (Render)
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",")
  : "*";

app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Simple health check route
app.get("/", (req, res) => {
  res.json({ message: "Blogging Platform API is running" });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));

// 404 handler for unknown routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
