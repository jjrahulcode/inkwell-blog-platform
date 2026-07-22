// ===========================================================
// PROFILE.JS - handles viewing and updating the user's profile
// ===========================================================

requireAuth();

const profileForm = document.getElementById("profileForm");

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

async function fetchProfile() {
  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: authHeaders(),
    });
    const user = await response.json();

    if (!response.ok) throw new Error(user.message || "Failed to load profile");

    document.getElementById("profileInitial").textContent = user.name.charAt(0).toUpperCase();
    document.getElementById("profileNameDisplay").textContent = user.name;
    document.getElementById("profileEmailDisplay").textContent = user.email;
    document.getElementById("profileName").value = user.name;
    document.getElementById("profileBio").value = user.bio || "";
  } catch (error) {
    showToast(error.message, "danger");
  }
}

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("profileName").value.trim();
  const bio = document.getElementById("profileBio").value.trim();

  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ name, bio }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to update profile");

    localStorage.setItem("userName", data.name);
    showToast("Profile updated successfully", "success");
    fetchProfile();
    renderNavbar();
  } catch (error) {
    showToast(error.message, "danger");
  }
});

document.addEventListener("DOMContentLoaded", fetchProfile);
