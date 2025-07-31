const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = 3000
const JWT_SECRET = "your-secret-key-change-in-production"

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// ========================================
// 📁 FILE STORAGE SETUP
// ========================================
const DATA_DIR = path.join(__dirname, "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")
const POSTS_FILE = path.join(DATA_DIR, "posts.json")
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json")

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  console.log("📁 Created data directory:", DATA_DIR)
}

// Initialize data arrays
let users = []
let posts = []
let analytics = {
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  dailyStats: [],
}

// ========================================
// 💾 FILE OPERATIONS
// ========================================
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf8")
      users = JSON.parse(data)
      console.log(`✅ Loaded ${users.length} users from file`)
    } else {
      console.log("📝 No users file found, starting with empty array")
      saveUsers()
    }
  } catch (error) {
    console.error("❌ Error loading users:", error)
    users = []
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    console.log(`💾 Saved ${users.length} users to file`)
  } catch (error) {
    console.error("❌ Error saving users:", error)
  }
}

function loadPosts() {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, "utf8")
      posts = JSON.parse(data)
      console.log(`✅ Loaded ${posts.length} posts from file`)
    } else {
      console.log("📝 No posts file found, starting with empty array")
      savePosts()
    }
  } catch (error) {
    console.error("❌ Error loading posts:", error)
    posts = []
  }
}

function savePosts() {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2))
    console.log(`💾 Saved ${posts.length} posts to file`)
  } catch (error) {
    console.error("❌ Error saving posts:", error)
  }
}

function loadAnalytics() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, "utf8")
      analytics = JSON.parse(data)
      console.log(`✅ Loaded analytics from file`)
    } else {
      console.log("📝 No analytics file found, starting with default")
      saveAnalytics()
    }
  } catch (error) {
    console.error("❌ Error loading analytics:", error)
  }
}

function saveAnalytics() {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2))
    console.log(`💾 Saved analytics to file`)
  } catch (error) {
    console.error("❌ Error saving analytics:", error)
  }
}

// Load all data on startup
loadUsers()
loadPosts()
loadAnalytics()

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      })
    }
    req.user = user
    next()
  })
}

// ========================================
// 🔐 AUTHENTICATION ENDPOINTS
// ========================================

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is working!",
    users: users.length,
    posts: posts.length,
    storage: {
      type: "JSON Files",
      location: DATA_DIR,
    },
    timestamp: new Date().toISOString(),
  })
})

// Register endpoint
app.post("/api/register", async (req, res) => {
  console.log("📝 Register request:", { ...req.body, password: "***" })
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "All fields are required",
      })
    }

    if (name.length < 2) {
      return res.json({
        success: false,
        message: "Name must be at least 2 characters",
      })
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email address",
      })
    }

    // Check if user exists
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return res.json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = {
      id: users.length + 1,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      posts: [],
      totalViews: 0,
      totalLikes: 0,
      followers: 0,
      bio: "",
      avatar: "",
    }

    users.push(user)
    saveUsers()

    console.log("✅ User created and saved:", { id: user.id, name: user.name, email: user.email })

    // Create token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("❌ Register error:", error)
    res.json({
      success: false,
      message: "Server error during registration",
    })
  }
})

// Login endpoint
app.post("/api/login", async (req, res) => {
  console.log("🔐 Login request:", { ...req.body, password: "***" })
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      })
    }

    // Find user
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
    if (!user) {
      return res.json({
        success: false,
        message: "No account found with this email. Please sign up first.",
      })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.json({
        success: false,
        message: "Invalid password",
      })
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    saveUsers()

    // Create token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("✅ Login successful and saved:", { id: user.id, name: user.name })

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.json({
      success: false,
      message: "Server error during login",
    })
  }
})

// ========================================
// 📝 BLOG POST ENDPOINTS
// ========================================

// Create new post
app.post("/api/posts", authenticateToken, (req, res) => {
  try {
    const { title, content, category, tags } = req.body

    if (!title || !content) {
      return res.json({
        success: false,
        message: "Title and content are required",
      })
    }

    const post = {
      id: posts.length + 1,
      userId: req.user.userId,
      author: req.user.name,
      title: title.trim(),
      content: content.trim(),
      category: category || "General",
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
      published: true,
    }

    posts.push(post)
    savePosts()

    // Update user's post count
    const user = users.find((u) => u.id === req.user.userId)
    if (user) {
      user.posts.push(post.id)
      saveUsers()
    }

    console.log("✅ Post created:", { id: post.id, title: post.title, author: post.author })

    res.json({
      success: true,
      message: "Post created successfully",
      post: post,
    })
  } catch (error) {
    console.error("❌ Create post error:", error)
    res.json({
      success: false,
      message: "Server error creating post",
    })
  }
})

// Get all posts (public)
app.get("/api/posts", (req, res) => {
  try {
    const publicPosts = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      author: post.author,
      title: post.title,
      content: post.content.substring(0, 200) + "...", // Preview
      category: post.category,
      tags: post.tags,
      createdAt: post.createdAt,
      views: post.views,
      likes: post.likes,
      commentsCount: post.comments.length,
    }))

    res.json({
      success: true,
      posts: publicPosts,
      total: posts.length,
    })
  } catch (error) {
    console.error("❌ Get posts error:", error)
    res.json({
      success: false,
      message: "Server error fetching posts",
    })
  }
})

// Get single post
app.get("/api/posts/:id", (req, res) => {
  try {
    const postId = Number.parseInt(req.params.id)
    const post = posts.find((p) => p.id === postId)

    if (!post) {
      return res.json({
        success: false,
        message: "Post not found",
      })
    }

    // Increment view count
    post.views++
    savePosts()

    res.json({
      success: true,
      post: post,
    })
  } catch (error) {
    console.error("❌ Get post error:", error)
    res.json({
      success: false,
      message: "Server error fetching post",
    })
  }
})

// Get user's posts
app.get("/api/my-posts", authenticateToken, (req, res) => {
  try {
    const userPosts = posts.filter((p) => p.userId === req.user.userId)

    res.json({
      success: true,
      posts: userPosts,
      total: userPosts.length,
    })
  } catch (error) {
    console.error("❌ Get user posts error:", error)
    res.json({
      success: false,
      message: "Server error fetching your posts",
    })
  }
})

// Update post
app.put("/api/posts/:id", authenticateToken, (req, res) => {
  try {
    const postId = Number.parseInt(req.params.id)
    const post = posts.find((p) => p.id === postId)

    if (!post) {
      return res.json({
        success: false,
        message: "Post not found",
      })
    }

    if (post.userId !== req.user.userId) {
      return res.json({
        success: false,
        message: "You can only edit your own posts",
      })
    }

    const { title, content, category, tags } = req.body

    if (title) post.title = title.trim()
    if (content) post.content = content.trim()
    if (category) post.category = category
    if (tags) post.tags = tags
    post.updatedAt = new Date().toISOString()

    savePosts()

    res.json({
      success: true,
      message: "Post updated successfully",
      post: post,
    })
  } catch (error) {
    console.error("❌ Update post error:", error)
    res.json({
      success: false,
      message: "Server error updating post",
    })
  }
})

// Delete post
app.delete("/api/posts/:id", authenticateToken, (req, res) => {
  try {
    const postId = Number.parseInt(req.params.id)
    const postIndex = posts.findIndex((p) => p.id === postId)

    if (postIndex === -1) {
      return res.json({
        success: false,
        message: "Post not found",
      })
    }

    const post = posts[postIndex]
    if (post.userId !== req.user.userId) {
      return res.json({
        success: false,
        message: "You can only delete your own posts",
      })
    }

    posts.splice(postIndex, 1)
    savePosts()

    // Remove from user's posts array
    const user = users.find((u) => u.id === req.user.userId)
    if (user) {
      user.posts = user.posts.filter((id) => id !== postId)
      saveUsers()
    }

    res.json({
      success: true,
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.error("❌ Delete post error:", error)
    res.json({
      success: false,
      message: "Server error deleting post",
    })
  }
})

// Like post
app.post("/api/posts/:id/like", authenticateToken, (req, res) => {
  try {
    const postId = Number.parseInt(req.params.id)
    const post = posts.find((p) => p.id === postId)

    if (!post) {
      return res.json({
        success: false,
        message: "Post not found",
      })
    }

    post.likes++
    savePosts()

    res.json({
      success: true,
      message: "Post liked successfully",
      likes: post.likes,
    })
  } catch (error) {
    console.error("❌ Like post error:", error)
    res.json({
      success: false,
      message: "Server error liking post",
    })
  }
})

// ========================================
// 📊 ANALYTICS ENDPOINTS
// ========================================

// Get user analytics
app.get("/api/analytics", authenticateToken, (req, res) => {
  try {
    const userPosts = posts.filter((p) => p.userId === req.user.userId)
    const totalViews = userPosts.reduce((sum, post) => sum + post.views, 0)
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0)
    const totalComments = userPosts.reduce((sum, post) => sum + post.comments.length, 0)

    const analytics = {
      totalPosts: userPosts.length,
      totalViews: totalViews,
      totalLikes: totalLikes,
      totalComments: totalComments,
      averageViews: userPosts.length > 0 ? Math.round(totalViews / userPosts.length) : 0,
      recentPosts: userPosts.slice(-5).map((p) => ({
        id: p.id,
        title: p.title,
        views: p.views,
        likes: p.likes,
        createdAt: p.createdAt,
      })),
      monthlyStats: generateMonthlyStats(userPosts),
    }

    res.json({
      success: true,
      analytics: analytics,
    })
  } catch (error) {
    console.error("❌ Analytics error:", error)
    res.json({
      success: false,
      message: "Server error fetching analytics",
    })
  }
})

function generateMonthlyStats(userPosts) {
  const months = {}
  userPosts.forEach((post) => {
    const month = new Date(post.createdAt).toISOString().substring(0, 7) // YYYY-MM
    if (!months[month]) {
      months[month] = { posts: 0, views: 0, likes: 0 }
    }
    months[month].posts++
    months[month].views += post.views
    months[month].likes += post.likes
  })
  return months
}

// ========================================
// 📊 DATA DASHBOARD ENDPOINTS
// ========================================

// Data dashboard endpoint
app.get("/api/data-dashboard", (req, res) => {
  try {
    // Calculate total views and likes from all posts
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0)
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0)
    const totalComments = posts.reduce((sum, post) => sum + (post.comments ? post.comments.length : 0), 0)

    // Get file stats
    const getFileStats = (filePath, dataArray) => {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath)
          return {
            path: filePath,
            exists: true,
            size: `${Math.round(stats.size / 1024)} KB`,
            records: dataArray.length,
            lastModified: stats.mtime.toISOString(),
          }
        }
        return {
          path: filePath,
          exists: false,
          size: "0 KB",
          records: 0,
          lastModified: "N/A",
        }
      } catch (error) {
        return {
          path: filePath,
          exists: false,
          size: "Error",
          records: 0,
          lastModified: "Error",
        }
      }
    }

    res.json({
      success: true,
      overview: {
        totalUsers: users.length,
        totalPosts: posts.length,
        totalViews: totalViews,
        totalLikes: totalLikes,
        totalComments: totalComments,
        averageViewsPerPost: posts.length > 0 ? Math.round(totalViews / posts.length) : 0,
      },
      storage: {
        type: "JSON Files",
        directory: DATA_DIR,
        files: {
          users: getFileStats(USERS_FILE, users),
          posts: getFileStats(POSTS_FILE, posts),
          analytics: getFileStats(ANALYTICS_FILE, [analytics]),
        },
      },
      recentUsers: users.slice(-10).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      })),
      recentPosts: posts.slice(-10).map((post) => ({
        id: post.id,
        title: post.title,
        author: post.author,
        category: post.category,
        views: post.views || 0,
        likes: post.likes || 0,
        createdAt: post.createdAt,
      })),
    })
  } catch (error) {
    console.error("❌ Data dashboard error:", error)
    res.json({
      success: false,
      message: "Error fetching dashboard data",
    })
  }
})

// Users endpoint for data viewer
app.get("/api/users", (req, res) => {
  try {
    const getFileStats = (filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath)
          return {
            location: filePath,
            size: `${Math.round(stats.size / 1024)} KB`,
            lastModified: stats.mtime.toISOString(),
          }
        }
        return {
          location: filePath,
          size: "0 KB",
          lastModified: "N/A",
        }
      } catch (error) {
        return {
          location: filePath,
          size: "Error",
          lastModified: "Error",
        }
      }
    }

    const sanitizedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      totalViews: user.totalViews || 0,
      totalLikes: user.totalLikes || 0,
      followers: user.followers || 0,
    }))

    res.json({
      success: true,
      users: sanitizedUsers,
      total: users.length,
      storage: getFileStats(USERS_FILE),
    })
  } catch (error) {
    console.error("❌ Users data error:", error)
    res.json({
      success: false,
      message: "Error fetching users data",
    })
  }
})

// ========================================
// ⚙️ USER SETTINGS ENDPOINTS
// ========================================

// Get user profile
app.get("/api/profile", authenticateToken, (req, res) => {
  try {
    const user = users.find((u) => u.id === req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        avatar: user.avatar || "",
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        totalViews: user.totalViews || 0,
        totalLikes: user.totalLikes || 0,
        followers: user.followers || 0,
      },
    })
  } catch (error) {
    console.error("❌ Profile error:", error)
    res.json({
      success: false,
      message: "Server error fetching profile",
    })
  }
})

// Update user profile
app.put("/api/profile", authenticateToken, (req, res) => {
  try {
    const user = users.find((u) => u.id === req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const { name, bio, avatar } = req.body

    if (name) user.name = name.trim()
    if (bio !== undefined) user.bio = bio.trim()
    if (avatar !== undefined) user.avatar = avatar.trim()

    saveUsers()

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("❌ Update profile error:", error)
    res.json({
      success: false,
      message: "Server error updating profile",
    })
  }
})

// Change password
app.put("/api/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.json({
        success: false,
        message: "Current password and new password are required",
      })
    }

    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "New password must be at least 8 characters long",
      })
    }

    const user = users.find((u) => u.id === req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password)
    if (!validPassword) {
      return res.json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword

    saveUsers()

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("❌ Change password error:", error)
    res.json({
      success: false,
      message: "Server error changing password",
    })
  }
})

// Logout endpoint
app.post("/api/logout", authenticateToken, (req, res) => {
  console.log("🚪 Logout request from user:", req.user.name)
  res.json({
    success: true,
    message: "Logged out successfully",
  })
})

// ========================================
// 🌐 STATIC FILE SERVING
// ========================================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"))
})

app.get("/auth", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth.html"))
})

app.get("/create-post", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "create-post.html"))
})

app.get("/my-posts", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "my-posts.html"))
})

app.get("/browse-blogs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "browse-blogs.html"))
})

app.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "analytics.html"))
})

app.get("/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "settings.html"))
})

app.get("/data", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "data-viewer.html"))
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  })
})

app.listen(PORT, () => {
  console.log(`🚀 BlogScript Server running on http://localhost:${PORT}`)
  console.log(`📝 Auth page: http://localhost:${PORT}/auth`)
  console.log(`🏠 Dashboard: http://localhost:${PORT}/`)
  console.log(`✍️ Create Post: http://localhost:${PORT}/create-post`)
  console.log(`📚 My Posts: http://localhost:${PORT}/my-posts`)
  console.log(`🌐 Browse Blogs: http://localhost:${PORT}/browse-blogs`)
  console.log(`📊 Analytics: http://localhost:${PORT}/analytics`)
  console.log(`⚙️ Settings: http://localhost:${PORT}/settings`)
  console.log(`📈 Data Viewer: http://localhost:${PORT}/data`)
  console.log(`💾 Data storage: ${DATA_DIR}`)
  console.log(`👥 Current users: ${users.length}`)
  console.log(`📝 Current posts: ${posts.length}`)
  console.log(`⏰ Started at: ${new Date().toISOString()}`)
})
