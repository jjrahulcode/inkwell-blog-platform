// This file defines all the authentication related API endpoints

const express = require("express");
const router = express.Router();
const { signupUser, loginUser, getProfile, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/signup - Register a new user
router.post("/signup", signupUser);

// POST /api/auth/login - Login an existing user
router.post("/login", loginUser);

// GET /api/auth/profile - Get the logged-in user's profile (protected)
router.get("/profile", protect, getProfile);

// PUT /api/auth/profile - Update the logged-in user's profile (protected)
router.put("/profile", protect, updateProfile);

module.exports = router;
