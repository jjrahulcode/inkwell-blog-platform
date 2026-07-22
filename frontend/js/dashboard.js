// ===========================================================
// DASHBOARD.JS - handles create, read, update, delete of the
// logged-in user's own blog posts
// ===========================================================

// Make sure only logged-in users can access this page
requireAuth();

const myBlogsContainer = document.getElementById("myBlogsContainer");
const loadingSpinner = document.getElementById("loadingSpinner");
const emptyState = document.getElementById("emptyState");
const blogForm = document.getElementById("blogForm");
const blogModalTitle = document.getElementById("blogModalTitle");
const blogSubmitBtn = document.getElementById("blogSubmitBtn");
const newBlogBtn = document.getElementById("newBlogBtn");

const blogModalEl = document.getElementById("blogModal");
const blogModal = new bootstrap.Modal(blogModalEl);

let myBlogs = [];

// Display the logged-in user's name in the welcome message
document.getElementById("welcomeName").textContent = localStorage.getItem("userName") || "Writer";

// Get the auth headers needed for protected requests
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

// Fetch the logged-in user's blogs
async function fetchMyBlogs() {
  loadingSpinner.classList.remove("d-none");
  myBlogsContainer.innerHTML = "";
  emptyState.classList.add("d-none");

  try {
    const response = await fetch(`${API_BASE}/blogs/user/myblogs`, {
      headers: authHeaders(),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to load your blogs");

    myBlogs = data;
    renderMyBlogs();
    updateStats();
  } catch (error) {
    showToast(error.message, "danger");
  } finally {
    loadingSpinner.classList.add("d-none");
  }
}

// Update the dashboard stat cards
function updateStats() {
  document.getElementById("totalBlogsCount").textContent = myBlogs.length;

  const totalComments = myBlogs.reduce((sum, blog) => sum + (blog.comments ? blog.comments.length : 0), 0);
  document.getElementById("totalCommentsCount").textContent = totalComments;

  if (myBlogs.length > 0) {
    const latest = myBlogs.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b));
    document.getElementById("latestPostDate").textContent = formatDate(latest.createdAt);
  }
}

// Render the blog cards for the dashboard
function renderMyBlogs() {
  if (!myBlogs.length) {
    emptyState.classList.remove("d-none");
    return;
  }

  myBlogsContainer.innerHTML = myBlogs
    .map(
      (blog) => `
      <div class="col-md-6 col-lg-4">
        <div class="card blog-card">
          <img src="${blog.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600"}" class="card-img-top" alt="${blog.title}" />
          <div class="card-body">
            <span class="badge-category">${blog.category}</span>
            <h5 class="card-title">${blog.title}</h5>
            <p class="card-text">${makeExcerpt(blog.content)}</p>
            <div class="card-meta mb-3">
              <span><i class="bi bi-chat-dots me-1"></i>${blog.comments ? blog.comments.length : 0} comments</span>
              <span>${formatDate(blog.createdAt)}</span>
            </div>
            <div class="d-flex gap-2">
              <a href="blog.html?id=${blog._id}" class="btn btn-outline-gradient flex-grow-1">View</a>
              <button class="icon-btn icon-btn-edit" onclick="openEditModal('${blog._id}')"><i class="bi bi-pencil"></i></button>
              <button class="icon-btn icon-btn-delete" onclick="confirmDeleteBlog('${blog._id}')"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// Reset the modal form back to "create" mode
newBlogBtn.addEventListener("click", () => {
  blogForm.reset();
  document.getElementById("blogId").value = "";
  blogModalTitle.textContent = "Create New Blog";
  blogSubmitBtn.innerHTML = `<i class="bi bi-check-circle me-1"></i> Publish Blog`;
});

// Open the modal pre-filled with an existing blog's data for editing
function openEditModal(id) {
  const blog = myBlogs.find((b) => b._id === id);
  if (!blog) return;

  document.getElementById("blogId").value = blog._id;
  document.getElementById("blogTitle").value = blog.title;
  document.getElementById("blogCategory").value = blog.category;
  document.getElementById("blogCoverImage").value = blog.coverImage || "";
  document.getElementById("blogContent").value = blog.content;

  blogModalTitle.textContent = "Edit Blog";
  blogSubmitBtn.innerHTML = `<i class="bi bi-check-circle me-1"></i> Update Blog`;

  blogModal.show();
}

// Ask for confirmation, then delete the blog
function confirmDeleteBlog(id) {
  showConfirm("Are you sure you want to delete this blog post? This cannot be undone.", () => deleteBlog(id));
}

async function deleteBlog(id) {
  try {
    const response = await fetch(`${API_BASE}/blogs/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to delete blog");

    showToast("Blog deleted successfully", "success");
    fetchMyBlogs();
  } catch (error) {
    showToast(error.message, "danger");
  }
}

// Handle both create and update through the same form
blogForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("blogId").value;
  const payload = {
    title: document.getElementById("blogTitle").value.trim(),
    category: document.getElementById("blogCategory").value,
    coverImage: document.getElementById("blogCoverImage").value.trim(),
    content: document.getElementById("blogContent").value.trim(),
  };

  blogSubmitBtn.disabled = true;
  const originalText = blogSubmitBtn.innerHTML;
  blogSubmitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Saving...`;

  try {
    const url = id ? `${API_BASE}/blogs/${id}` : `${API_BASE}/blogs`;
    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to save blog");

    showToast(id ? "Blog updated successfully" : "Blog published successfully", "success");
    blogModal.hide();
    blogForm.reset();
    fetchMyBlogs();
  } catch (error) {
    showToast(error.message, "danger");
  } finally {
    blogSubmitBtn.disabled = false;
    blogSubmitBtn.innerHTML = originalText;
  }
});

document.addEventListener("DOMContentLoaded", fetchMyBlogs);
