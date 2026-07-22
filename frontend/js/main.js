// ===========================================================
// MAIN.JS - handles the public homepage blog listing
// ===========================================================

const blogsContainer = document.getElementById("blogsContainer");
const loadingSpinner = document.getElementById("loadingSpinner");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let searchTimeout;

// Fetch blogs from the API, optionally filtered by search/category
async function fetchBlogs() {
  loadingSpinner.classList.remove("d-none");
  blogsContainer.innerHTML = "";
  emptyState.classList.add("d-none");

  try {
    const search = searchInput.value.trim();
    const category = categoryFilter.value;

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);

    const response = await fetch(`${API_BASE}/blogs?${params.toString()}`);
    const blogs = await response.json();

    if (!response.ok) {
      throw new Error(blogs.message || "Failed to load blogs");
    }

    renderBlogs(blogs);
  } catch (error) {
    showToast(error.message, "danger");
  } finally {
    loadingSpinner.classList.add("d-none");
  }
}

// Render blog cards into the grid
function renderBlogs(blogs) {
  if (!blogs.length) {
    emptyState.classList.remove("d-none");
    return;
  }

  blogsContainer.innerHTML = blogs
    .map(
      (blog) => `
      <div class="col-md-6 col-lg-4">
        <div class="card blog-card">
          <img src="${blog.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600"}" class="card-img-top" alt="${blog.title}" />
          <div class="card-body">
            <span class="badge-category">${blog.category}</span>
            <h5 class="card-title">${blog.title}</h5>
            <p class="card-text">${makeExcerpt(blog.content)}</p>
            <div class="card-meta">
              <span><i class="bi bi-person-circle me-1"></i>${blog.authorName}</span>
              <span>${formatDate(blog.createdAt)}</span>
            </div>
            <a href="blog.html?id=${blog._id}" class="btn btn-gradient w-100 mt-3">Read More</a>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// Debounced search input
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchBlogs, 400);
});

categoryFilter.addEventListener("change", fetchBlogs);

document.addEventListener("DOMContentLoaded", fetchBlogs);
