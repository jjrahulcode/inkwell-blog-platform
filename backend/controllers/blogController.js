// This file contains the logic for all blog related CRUD operations

const Blog = require("../models/Blog");

// @desc    Get all blogs (public listing)
// @route   GET /api/blogs
// @access  Public
const getAllBlogs = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    // Build a dynamic filter object based on query params
    let filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single blog by id
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }

    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

// @desc    Get blogs belonging to the logged-in user
// @route   GET /api/blogs/user/myblogs
// @access  Private
const getMyBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res, next) => {
  try {
    const { title, content, category, coverImage } = req.body;

    if (!title || !content) {
      res.status(400);
      throw new Error("Please provide a title and content");
    }

    const blog = await Blog.create({
      title,
      content,
      category: category || "General",
      coverImage: coverImage || "",
      author: req.user._id,
      authorName: req.user.name,
    });

    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/blogs/:id
// @access  Private (only the owner)
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }

    // Ensure the logged-in user owns this blog post
    if (blog.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You are not authorized to update this blog");
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    blog.category = req.body.category || blog.category;
    blog.coverImage = req.body.coverImage !== undefined ? req.body.coverImage : blog.coverImage;

    const updatedBlog = await blog.save();
    res.status(200).json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private (only the owner)
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You are not authorized to delete this blog");
    }

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully", id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a blog post
// @route   POST /api/blogs/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400);
      throw new Error("Comment text is required");
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }

    const comment = {
      user: req.user._id,
      name: req.user.name,
      text,
    };

    blog.comments.push(comment);
    await blog.save();

    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getMyBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
};
