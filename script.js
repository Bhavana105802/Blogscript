// --- DOM Elements ---
const heroSection = document.getElementById("hero-section")
const appContainer = document.getElementById("app-container")
const mainContent = document.getElementById("main-content")
const dashboardLink = document.getElementById("dashboard-link")
const authLink = document.getElementById("auth-link")
const logoutButton = document.getElementById("logout-button")

// --- Data Storage (localStorage) ---
const STORAGE_KEY_USERS = "blogscript_users"
const STORAGE_KEY_BLOGS = "blogscript_blogs"
const STORAGE_KEY_CURRENT_USER = "blogscript_current_user"

const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || []
let blogs = JSON.parse(localStorage.getItem(STORAGE_KEY_BLOGS)) || []
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRENT_USER))

// --- Helper Functions ---
function saveUsers() {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users))
}

function saveBlogs() {
  localStorage.setItem(STORAGE_KEY_BLOGS, JSON.stringify(blogs))
}

function saveCurrentUser() {
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser))
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function updateAuthUI() {
  if (currentUser) {
    dashboardLink.classList.remove("hidden")
    authLink.classList.add("hidden")
    logoutButton.classList.remove("hidden")
  } else {
    dashboardLink.classList.add("hidden")
    authLink.classList.remove("hidden")
    authLink.textContent = "Login / Register"
    logoutButton.classList.add("hidden")
  }
}

function showMessage(element, message, type) {
  element.textContent = message
  element.className = `message ${type}`
  element.classList.remove("hidden")
  setTimeout(() => {
    element.classList.add("hidden")
  }, 3000)
}

// --- Authentication ---
function registerUser(username, password) {
  if (users.some((user) => user.username === username)) {
    return { success: false, message: "Username already exists." }
  }
  const newUser = { id: generateUniqueId(), username, password }
  users.push(newUser)
  saveUsers()
  currentUser = newUser
  saveCurrentUser()
  updateAuthUI()
  return { success: true, message: "Registration successful!" }
}

function loginUser(username, password) {
  const user = users.find((u) => u.username === username && u.password === password)
  if (user) {
    currentUser = user
    saveCurrentUser()
    updateAuthUI()
    return { success: true, message: "Login successful!" }
  }
  return { success: false, message: "Invalid username or password." }
}

function logoutUser() {
  currentUser = null
  saveCurrentUser()
  updateAuthUI()
  window.location.hash = "#home" // Redirect to home after logout
}

// --- Blog Management ---
function createBlog(title, description, imageUrl, isPublic) {
  if (!currentUser) return { success: false, message: "User not logged in." }
  const newBlog = {
    id: generateUniqueId(),
    userId: currentUser.id,
    author: currentUser.username,
    title,
    description,
    imageUrl: imageUrl || "/placeholder.svg?height=200&width=400",
    isPublic,
    likes: 0,
    likedBy: [],
  }
  blogs.push(newBlog)
  saveBlogs()
  return { success: true, message: "Blog created successfully!" }
}

function updateBlog(blogId, title, description, imageUrl, isPublic) {
  const blogIndex = blogs.findIndex((b) => b.id === blogId && b.userId === currentUser.id)
  if (blogIndex === -1) return { success: false, message: "Blog not found or unauthorized." }

  blogs[blogIndex] = {
    ...blogs[blogIndex],
    title,
    description,
    imageUrl: imageUrl || "/placeholder.svg?height=200&width=400",
    isPublic,
  }
  saveBlogs()
  return { success: true, message: "Blog updated successfully!" }
}

function deleteBlog(blogId) {
  const initialLength = blogs.length
  blogs = blogs.filter((b) => !(b.id === blogId && b.userId === currentUser.id))
  saveBlogs()
  return { success: blogs.length < initialLength, message: "Blog deleted successfully." }
}

function toggleLike(blogId) {
  const blog = blogs.find((b) => b.id === blogId)
  if (!blog || !currentUser) return

  const userLikedIndex = blog.likedBy.indexOf(currentUser.id)
  if (userLikedIndex === -1) {
    blog.likes++
    blog.likedBy.push(currentUser.id)
  } else {
    blog.likes--
    blog.likedBy.splice(userLikedIndex, 1)
  }
  saveBlogs()
  // Re-render the specific blog card or detail view to update like count/state
  if (window.location.hash.startsWith("#blog/")) {
    renderIndividualBlog(blogId)
  } else if (window.location.hash === "#public-feed") {
    renderPublicFeed()
  } else if (window.location.hash === "#dashboard") {
    renderDashboard()
  }
}

// --- UI Rendering Functions ---

function renderHomePage() {
  heroSection.classList.remove("hidden")
  appContainer.classList.add("hidden")
  document.body.style.overflow = "hidden" // Prevent scroll on hero page
}

function renderAppPage() {
  heroSection.classList.add("hidden")
  appContainer.classList.remove("hidden")
  document.body.style.overflow = "auto" // Allow scroll for app content
  updateAuthUI()
}

function renderLoginRegisterPage() {
  renderAppPage()
  mainContent.innerHTML = `
        <div class="form-container">
            <h2 id="auth-title">Login</h2>
            <div id="auth-message" class="message hidden" aria-live="polite"></div>
            <form id="auth-form">
                <input type="text" id="auth-username" placeholder="Username" required autocomplete="username">
                <input type="password" id="auth-password" placeholder="Password" required autocomplete="current-password">
                <button type="submit" id="auth-submit-button">Login</button>
            </form>
            <p class="toggle-link" id="toggle-auth-mode">Don't have an account? Register here.</p>
        </div>
    `

  const authTitle = document.getElementById("auth-title")
  const authForm = document.getElementById("auth-form")
  const authUsernameInput = document.getElementById("auth-username")
  const authPasswordInput = document.getElementById("auth-password")
  const authSubmitButton = document.getElementById("auth-submit-button")
  const toggleAuthMode = document.getElementById("toggle-auth-mode")
  const authMessage = document.getElementById("auth-message")

  let isLoginMode = true

  toggleAuthMode.addEventListener("click", () => {
    isLoginMode = !isLoginMode
    authTitle.textContent = isLoginMode ? "Login" : "Register"
    authSubmitButton.textContent = isLoginMode ? "Login" : "Register"
    toggleAuthMode.textContent = isLoginMode
      ? "Don't have an account? Register here."
      : "Already have an account? Login here."
    authForm.reset()
    authMessage.classList.add("hidden")
  })

  authForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const username = authUsernameInput.value.trim()
    const password = authPasswordInput.value.trim()

    if (!username || !password) {
      showMessage(authMessage, "Please fill in all fields.", "error")
      return
    }

    let result
    if (isLoginMode) {
      result = loginUser(username, password)
    } else {
      result = registerUser(username, password)
    }

    showMessage(authMessage, result.message, result.success ? "success" : "error")

    if (result.success) {
      authForm.reset()
      setTimeout(() => {
        window.location.hash = "#dashboard"
      }, 1000)
    }
  })
}

function renderDashboard() {
  if (!currentUser) {
    window.location.hash = "#login"
    return
  }
  renderAppPage()
  const userBlogs = blogs.filter((blog) => blog.userId === currentUser.id)

  mainContent.innerHTML = `
        <h2 class="text-center mb-20">Welcome, ${currentUser.username}!</h2>
        <div class="text-center mb-20">
            <button id="create-blog-button" class="cta-button">Create New Blog</button>
        </div>
        <h3 class="text-center mb-20">Your Blog Posts</h3>
        <div id="user-blogs-grid" class="blog-grid">
            ${userBlogs.length === 0 ? '<p class="text-center mt-20">You haven\'t created any blogs yet. Start by creating one!</p>' : ""}
        </div>
    `

  document.getElementById("create-blog-button").addEventListener("click", () => {
    window.location.hash = "#create-blog"
  })

  const userBlogsGrid = document.getElementById("user-blogs-grid")
  userBlogs.forEach((blog) => {
    const blogCard = document.createElement("div")
    blogCard.className = "blog-card"
    blogCard.innerHTML = `
            <img src="${blog.imageUrl}" alt="${blog.title}" />
            <div class="blog-card-content">
                <h3 data-blog-id="${blog.id}">${blog.title}</h3>
                <p>${blog.description}</p>
                <div class="blog-card-footer">
                    <div class="likes">
                        <button class="like-button" data-blog-id="${blog.id}" aria-label="Like this blog">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${blog.likedBy.includes(currentUser.id) ? "var(--primary-color)" : "none"}" stroke="${blog.likedBy.includes(currentUser.id) ? "var(--primary-color)" : "currentColor"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            <span>${blog.likes}</span>
                        </button>
                    </div>
                    <div class="actions">
                        <button data-action="edit" data-blog-id="${blog.id}">Edit</button>
                        <button data-action="delete" data-blog-id="${blog.id}" class="delete">Delete</button>
                        <button data-action="toggle-public" data-blog-id="${blog.id}">${blog.isPublic ? "Make Private" : "Make Public"}</button>
                    </div>
                    <span class="status ${blog.isPublic ? "public" : "private"}">${blog.isPublic ? "Public" : "Private"}</span>
                </div>
            </div>
        `
    userBlogsGrid.appendChild(blogCard)
  })

  userBlogsGrid.addEventListener("click", (e) => {
    const blogId = e.target.dataset.blogId || e.target.closest("[data-blog-id]")?.dataset.blogId
    if (!blogId) return

    if (e.target.tagName === "H3" || e.target.closest("h3")) {
      window.location.hash = `#blog/${blogId}`
    } else if (e.target.dataset.action === "edit") {
      window.location.hash = `#edit-blog/${blogId}`
    } else if (e.target.dataset.action === "delete") {
      if (confirm("Are you sure you want to delete this blog post?")) {
        const result = deleteBlog(blogId)
        showMessage(mainContent.querySelector("h2"), result.message, result.success ? "success" : "error")
        renderDashboard() // Re-render dashboard after deletion
      }
    } else if (e.target.dataset.action === "toggle-public") {
      const blog = blogs.find((b) => b.id === blogId)
      if (blog) {
        updateBlog(blogId, blog.title, blog.description, blog.imageUrl, !blog.isPublic)
        showMessage(mainContent.querySelector("h2"), `Blog set to ${blog.isPublic ? "private" : "public"}.`, "success")
        renderDashboard() // Re-render dashboard after toggle
      }
    } else if (e.target.closest(".like-button")) {
      toggleLike(blogId)
    }
  })
}

function renderCreateEditBlogPage(blogId = null) {
  if (!currentUser) {
    window.location.hash = "#login"
    return
  }
  renderAppPage()

  let blogToEdit = null
  if (blogId) {
    blogToEdit = blogs.find((b) => b.id === blogId && b.userId === currentUser.id)
    if (!blogToEdit) {
      alert("Blog not found or you do not have permission to edit it.")
      window.location.hash = "#dashboard"
      return
    }
  }

  mainContent.innerHTML = `
        <div class="form-container">
            <h2>${blogId ? "Edit Blog Post" : "Create New Blog Post"}</h2>
            <div id="blog-form-message" class="message hidden" aria-live="polite"></div>
            <form id="blog-form">
                <input type="text" id="blog-title" placeholder="Blog Title" value="${blogToEdit ? blogToEdit.title : ""}" required>
                <textarea id="blog-description" placeholder="Your story goes here..." required>${blogToEdit ? blogToEdit.description : ""}</textarea>
                <input type="text" id="blog-image-url" placeholder="Image URL (optional)" value="${blogToEdit ? blogToEdit.imageUrl : ""}">
                <div class="checkbox-group">
                    <input type="checkbox" id="blog-is-public" ${blogToEdit && blogToEdit.isPublic ? "checked" : ""}>
                    <label for="blog-is-public">Make Public</label>
                </div>
                <button type="submit">${blogId ? "Save Changes" : "Create Blog"}</button>
            </form>
        </div>
    `

  const blogForm = document.getElementById("blog-form")
  const blogTitleInput = document.getElementById("blog-title")
  const blogDescriptionInput = document.getElementById("blog-description")
  const blogImageUrlInput = document.getElementById("blog-image-url")
  const blogIsPublicCheckbox = document.getElementById("blog-is-public")
  const blogFormMessage = document.getElementById("blog-form-message")

  blogForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const title = blogTitleInput.value.trim()
    const description = blogDescriptionInput.value.trim()
    const imageUrl = blogImageUrlInput.value.trim()
    const isPublic = blogIsPublicCheckbox.checked

    if (!title || !description) {
      showMessage(blogFormMessage, "Title and Description are required.", "error")
      return
    }

    let result
    if (blogId) {
      result = updateBlog(blogId, title, description, imageUrl, isPublic)
    } else {
      result = createBlog(title, description, imageUrl, isPublic)
    }

    showMessage(blogFormMessage, result.message, result.success ? "success" : "error")

    if (result.success) {
      blogForm.reset()
      setTimeout(() => {
        window.location.hash = "#dashboard"
      }, 1000)
    }
  })
}

function renderPublicFeed() {
  renderAppPage()
  const publicBlogs = blogs.filter((blog) => blog.isPublic)

  mainContent.innerHTML = `
        <h2 class="text-center mb-20">Explore Public Blogs</h2>
        <div id="public-blogs-grid" class="blog-grid">
            ${publicBlogs.length === 0 ? '<p class="text-center mt-20">No public blogs available yet. Be the first to share!</p>' : ""}
        </div>
    `

  const publicBlogsGrid = document.getElementById("public-blogs-grid")
  publicBlogs.forEach((blog) => {
    const blogCard = document.createElement("div")
    blogCard.className = "blog-card"
    blogCard.innerHTML = `
            <img src="${blog.imageUrl}" alt="${blog.title}" />
            <div class="blog-card-content">
                <h3 data-blog-id="${blog.id}">${blog.title}</h3>
                <p>${blog.description}</p>
                <div class="blog-card-footer">
                    <div class="likes">
                        <button class="like-button ${currentUser && blog.likedBy.includes(currentUser.id) ? "liked" : ""}" data-blog-id="${blog.id}" aria-label="Like this blog">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${currentUser && blog.likedBy.includes(currentUser.id) ? "var(--primary-color)" : "none"}" stroke="${currentUser && blog.likedBy.includes(currentUser.id) ? "var(--primary-color)" : "currentColor"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            <span>${blog.likes}</span>
                        </button>
                    </div>
                    <span class="text-light">By ${blog.author}</span>
                </div>
            </div>
        `
    publicBlogsGrid.appendChild(blogCard)
  })

  publicBlogsGrid.addEventListener("click", (e) => {
    const blogId = e.target.dataset.blogId || e.target.closest("[data-blog-id]")?.dataset.blogId
    if (!blogId) return

    if (e.target.tagName === "H3" || e.target.closest("h3")) {
      window.location.hash = `#blog/${blogId}`
    } else if (e.target.closest(".like-button")) {
      if (!currentUser) {
        alert("Please log in to like blogs.")
        window.location.hash = "#login"
        return
      }
      toggleLike(blogId)
    }
  })
}

function renderIndividualBlog(blogId) {
  renderAppPage()
  const blog = blogs.find((b) => b.id === blogId)

  if (!blog || (!blog.isPublic && (!currentUser || blog.userId !== currentUser.id))) {
    mainContent.innerHTML = `
            <div class="form-container">
                <h2>Blog Not Found or Unauthorized</h2>
                <p>The blog you are looking for does not exist or you do not have permission to view it.</p>
                <a href="#public-feed" class="cta-button mt-20">Go to Public Feed</a>
            </div>
        `
    return
  }

  mainContent.innerHTML = `
        <div class="blog-detail-container">
            <img src="${blog.imageUrl}" alt="${blog.title}" />
            <h2>${blog.title}</h2>
            <p>${blog.description}</p>
            <div class="blog-detail-footer">
                <button class="like-button ${currentUser && blog.likedBy.includes(currentUser.id) ? "liked" : ""}" data-blog-id="${blog.id}" aria-label="Like this blog">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${currentUser && blog.likedBy.includes(currentUser.id) ? "var(--primary-color)" : "none"}" stroke="${currentUser && blog.likedBy.includes(currentUser.id) ? "var(--primary-color)" : "currentColor"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    <span>${blog.likes} Likes</span>
                </button>
                <a href="${currentUser && blog.userId === currentUser.id ? "#dashboard" : "#public-feed"}" class="back-button">Back to ${currentUser && blog.userId === currentUser.id ? "Dashboard" : "Feed"}</a>
            </div>
        </div>
    `

  document.querySelector(".blog-detail-footer .like-button").addEventListener("click", (e) => {
    if (!currentUser) {
      alert("Please log in to like blogs.")
      window.location.hash = "#login"
      return
    }
    toggleLike(blogId)
  })
}

// --- Routing Logic ---
function handleRouteChange() {
  const hash = window.location.hash
  if (hash === "" || hash === "#home") {
    renderHomePage()
  } else if (hash === "#login") {
    renderLoginRegisterPage()
  } else if (hash === "#dashboard") {
    renderDashboard()
  } else if (hash === "#create-blog") {
    renderCreateEditBlogPage()
  } else if (hash.startsWith("#edit-blog/")) {
    const blogId = hash.split("/")[1]
    renderCreateEditBlogPage(blogId)
  } else if (hash === "#public-feed") {
    renderPublicFeed()
  } else if (hash.startsWith("#blog/")) {
    const blogId = hash.split("/")[1]
    renderIndividualBlog(blogId)
  } else {
    // Fallback for unknown routes
    mainContent.innerHTML = `
            <div class="form-container">
                <h2>Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
                <a href="#home" class="cta-button mt-20">Go to Home</a>
            </div>
        `
    renderAppPage()
  }
}

// --- Event Listeners ---
window.addEventListener("hashchange", handleRouteChange)
logoutButton.addEventListener("click", logoutUser)

// --- Initial App Setup ---
document.addEventListener("DOMContentLoaded", () => {
  handleRouteChange()
  updateAuthUI() // Ensure UI is correct on initial load
})
