// This file defines all the blog related API endpoints

const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  getMyBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
} = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/blogs - Get all blogs (supports ?search= and ?category=)
router.get("/", getAllBlogs);

// GET /api/blogs/user/myblogs - Get blogs belonging to the logged-in user
router.get("/user/myblogs", protect, getMyBlogs);

// POST /api/blogs - Create a new blog (protected)
router.post("/", protect, createBlog);

// GET /api/blogs/:id - Get a single blog by id
router.get("/:id", getBlogById);

// PUT /api/blogs/:id - Update a blog (protected, owner only)
router.put("/:id", protect, updateBlog);

// DELETE /api/blogs/:id - Delete a blog (protected, owner only)
router.delete("/:id", protect, deleteBlog);

// POST /api/blogs/:id/comments - Add a comment to a blog (protected)
router.post("/:id/comments", protect, addComment);

module.exports = router;
