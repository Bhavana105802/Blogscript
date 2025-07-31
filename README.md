# BlogScript Authentication System

A complete authentication system for BlogScript with Express.js backend and beautiful frontend.

## Features

- ✅ User Registration & Login
- ✅ Password Hashing with bcrypt
- ✅ JWT Token Authentication
- ✅ Beautiful Dashboard with Background Video
- ✅ Responsive Design
- ✅ Same Color Scheme as Main Site (#ffa726, #ff6f61, #e85a4f)
- ✅ Real Authentication Validation

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Start the Server

\`\`\`bash
npm start
\`\`\`

Or for development with auto-restart:

\`\`\`bash
npm run dev
\`\`\`

## Access the Application

- Landing Page: http://localhost:3000/home.html
- Dashboard (Main): http://localhost:3000 (requires authentication)
- Auth Page: http://localhost:3000/auth.html

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/profile` - Get user profile (protected)
- `GET /api/users` - Get all users (debug endpoint)

## Authentication Flow

1. **Landing Page** (`/home.html`): Beautiful landing page with hero section
2. **Sign Up/In** (`/auth.html`): Users create account or sign in
3. **Dashboard** (`/`): Your beautiful dashboard (main page after login)
4. **Protection**: Dashboard redirects to auth if not logged in

## File Structure

\`\`\`
├── server.js              # Express.js server
├── package.json           # Dependencies
├── public/
│   ├── home.html          # Landing page
│   ├── dashboard.html     # Your beautiful dashboard (main)
│   ├── auth.html          # Authentication page
│   └── 4828605-uhd_4096_2160_25fps.mp4  # Background video
└── README.md              # This file
\`\`\`

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- Protected routes
- Session management

## Color Scheme

Using the same beautiful colors from index.html:
- Primary: #ffa726 (Orange)
- Secondary: #ff6f61 (Coral)
- Accent: #e85a4f (Red-Orange)

## Notes

- Users must create account before signing in
- Passwords must be at least 8 characters
- Email validation included
- Beautiful glass morphism design
- Background video same as main site
