// ========================================
// CURRENT STORAGE (In Memory - Temporary)
// ========================================

// This is what you have now in server.js
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "$2a$12$hashedpassword...",
    createdAt: "2024-01-15T10:30:00.000Z",
    lastLogin: "2024-01-15T14:20:00.000Z",
  },
  // More users...
]

// ========================================
// OPTION 1: JSON FILE STORAGE (Simple)
// ========================================

const fs = require("fs")
const path = require("path")

// Save users to JSON file
function saveUsersToFile(users) {
  const filePath = path.join(__dirname, "data", "users.json")

  // Create data directory if it doesn't exist
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
  }

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2))
  console.log("✅ Users saved to file:", filePath)
}

// Load users from JSON file
function loadUsersFromFile() {
  const filePath = path.join(__dirname, "data", "users.json")

  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8")
      const users = JSON.parse(data)
      console.log("✅ Users loaded from file:", users.length, "users")
      return users
    }
  } catch (error) {
    console.error("❌ Error loading users from file:", error)
  }

  return [] // Return empty array if file doesn't exist or error
}

// ========================================
// OPTION 2: SQLite DATABASE (Recommended)
// ========================================

const sqlite3 = require("sqlite3").verbose()

// Create database and users table
function initializeDatabase() {
  const db = new sqlite3.Database("./data/blogscript.db")

  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create posts table for future use
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    console.log("✅ Database initialized successfully")
  })

  return db
}

// Database operations
const DatabaseOperations = {
  // Create new user
  createUser: (db, userData) => {
    return new Promise((resolve, reject) => {
      const { name, email, password } = userData

      db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password], function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({
            id: this.lastID,
            name,
            email,
            created_at: new Date().toISOString(),
          })
        }
      })
    })
  },

  // Find user by email
  findUserByEmail: (db, email) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },

  // Update last login
  updateLastLogin: (db, userId) => {
    return new Promise((resolve, reject) => {
      db.run("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [userId], (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  },

  // Get all users
  getAllUsers: (db) => {
    return new Promise((resolve, reject) => {
      db.all("SELECT id, name, email, created_at, last_login FROM users", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  },
}

// ========================================
// OPTION 3: MONGODB (Advanced)
// ========================================

const mongoose = require("mongoose")

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
})

const User = mongoose.model("User", userSchema)

// MongoDB operations
const MongoOperations = {
  // Connect to MongoDB
  connect: async () => {
    try {
      await mongoose.connect("mongodb://localhost:27017/blogscript")
      console.log("✅ Connected to MongoDB")
    } catch (error) {
      console.error("❌ MongoDB connection error:", error)
    }
  },

  // Create user
  createUser: async (userData) => {
    try {
      const user = new User(userData)
      await user.save()
      return user
    } catch (error) {
      throw error
    }
  },

  // Find user by email
  findUserByEmail: async (email) => {
    try {
      const user = await User.findOne({ email })
      return user
    } catch (error) {
      throw error
    }
  },

  // Update last login
  updateLastLogin: async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { lastLogin: new Date() })
    } catch (error) {
      throw error
    }
  },
}

// ========================================
// OPTION 4: CLOUD DATABASES
// ========================================

// Examples of cloud database connections:

// Supabase (PostgreSQL)
const supabaseConfig = {
  url: "https://your-project.supabase.co",
  key: "your-anon-key",
  // Table: users
  // Columns: id, name, email, password, created_at, last_login
}

// Firebase Firestore
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // Collection: users
  // Documents: { name, email, password, createdAt, lastLogin }
}

// MongoDB Atlas (Cloud MongoDB)
const mongoAtlasConfig = {
  connectionString: "mongodb+srv://username:password@cluster.mongodb.net/blogscript",
}

module.exports = {
  // File operations
  saveUsersToFile,
  loadUsersFromFile,

  // SQLite operations
  initializeDatabase,
  DatabaseOperations,

  // MongoDB operations
  MongoOperations,

  // Cloud configs
  supabaseConfig,
  firebaseConfig,
  mongoAtlasConfig,
}
