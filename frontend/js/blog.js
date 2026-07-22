// ===========================================================
// BLOG.JS - handles fetching and displaying a single blog post
// along with its comments
// ===========================================================

const params = new URLSearchParams(window.location.search);
const blogId = params.get("id");

const loadingSpinner = document.getElementById("loadingSpinner");
const blogArticle = document.getElementById("blogArticle");
const commentForm = document.getElementById("commentForm");
const commentFormWrapper = document.getElementById("commentFormWrapper");
const loginToCommentMsg = document.getElementById("loginToCommentMsg");

async function fetchBlog() {
  if (!blogId) {
    showToast("No blog specified", "danger");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/blogs/${blogId}`);
    const blog = await response.json();

    if (!response.ok) throw new Error(blog.message || "Blog not found");

    renderBlog(blog);
  } catch (error) {
    showToast(error.message, "danger");
  } finally {
    loadingSpinner.classList.add("d-none");
  }
}

function renderBlog(blog) {
  document.getElementById("blogCategory").textContent = blog.category;
  document.getElementById("blogTitle").textContent = blog.title;
  document.getElementById("blogAuthor").textContent = blog.authorName;
  document.getElementById("blogDate").textContent = formatDate(blog.createdAt);
  document.getElementById("blogContent").innerHTML = blog.content.replace(/\n/g, "<br><br>");

  const coverImg = document.getElementById("blogCoverImage");
  if (blog.coverImage) {
    coverImg.src = blog.coverImage;
  } else {
    coverImg.remove();
  }

  renderComments(blog.comments || []);
  blogArticle.classList.remove("d-none");

  // Show comment form only if logged in
  if (localStorage.getItem("token")) {
    commentFormWrapper.classList.remove("d-none");
    loginToCommentMsg.classList.add("d-none");
  } else {
    commentFormWrapper.classList.add("d-none");
    loginToCommentMsg.classList.remove("d-none");
  }
}

function renderComments(comments) {
  document.getElementById("commentCount").textContent = comments.length;
  const commentsList = document.getElementById("commentsList");

  if (!comments.length) {
    commentsList.innerHTML = `<p class="text-muted">No comments yet. Be the first to share your thoughts!</p>`;
    return;
  }

  commentsList.innerHTML = comments
    .slice()
    .reverse()
    .map(
      (c) => `
      <div class="d-flex gap-3 mb-4">
        <div class="avatar-circle">${c.name.charAt(0).toUpperCase()}</div>
        <div>
          <h6 class="fw-bold mb-1">${c.name}</h6>
          <p class="mb-1">${c.text}</p>
          <small class="text-muted">${formatDate(c.createdAt)}</small>
        </div>
      </div>
    `
    )
    .join("");
}

if (commentForm) {
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = document.getElementById("commentText").value.trim();
    if (!text) return;

    try {
      const response = await fetch(`${API_BASE}/blogs/${blogId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text }),
      });

      const blog = await response.json();

      if (!response.ok) throw new Error(blog.message || "Failed to post comment");

      renderComments(blog.comments);
      commentForm.reset();
      showToast("Comment posted", "success");
    } catch (error) {
      showToast(error.message, "danger");
    }
  });
}

document.addEventListener("DOMContentLoaded", fetchBlog);
