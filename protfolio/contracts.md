# API Contracts & Integration Plan

## Mock Data to Remove from Frontend
- `/app/frontend/src/mock.js` - All mock data will be replaced with API calls

## Backend APIs to Implement

### 1. Authentication APIs
- **POST /api/auth/login** - Admin login
  - Request: `{ email, password }`
  - Response: `{ token, user: { id, email, name } }`
  
- **POST /api/auth/register** - Admin registration (one-time setup)
  - Request: `{ email, password, name }`
  - Response: `{ message, user }`

### 2. Portfolio Content APIs

#### Personal Info
- **GET /api/portfolio/info** - Get personal information
  - Response: `{ name, title, cgpa, email, phone, linkedin, github, profileImage, resumeUrl }`
  
- **PUT /api/portfolio/info** - Update personal info (Admin only)
  - Request: Personal info object
  - Response: Updated info

#### About Section
- **GET /api/portfolio/about** - Get about section
  - Response: `{ description, interests[], qualities[] }`
  
- **PUT /api/portfolio/about** - Update about section (Admin only)

#### Skills
- **GET /api/portfolio/skills** - Get all skills
  - Response: `[{ name, level, category }]`
  
- **POST /api/portfolio/skills** - Add skill (Admin only)
- **PUT /api/portfolio/skills/:id** - Update skill (Admin only)
- **DELETE /api/portfolio/skills/:id** - Delete skill (Admin only)

#### Projects
- **GET /api/portfolio/projects** - Get all projects
  - Query params: `?featured=true` (optional)
  - Response: `[{ id, title, description, image, technologies[], githubUrl, liveUrl, featured, award }]`
  
- **POST /api/portfolio/projects** - Add project (Admin only)
- **PUT /api/portfolio/projects/:id** - Update project (Admin only)
- **DELETE /api/portfolio/projects/:id** - Delete project (Admin only)

#### Achievements
- **GET /api/portfolio/achievements** - Get all achievements
  - Response: `[{ id, title, description, icon, year }]`
  
- **POST /api/portfolio/achievements** - Add achievement (Admin only)
- **PUT /api/portfolio/achievements/:id** - Update achievement (Admin only)
- **DELETE /api/portfolio/achievements/:id** - Delete achievement (Admin only)

#### Education
- **GET /api/portfolio/education** - Get education timeline
  - Response: `[{ id, degree, institution, duration, score, status }]`
  
- **POST /api/portfolio/education** - Add education (Admin only)
- **PUT /api/portfolio/education/:id** - Update education (Admin only)
- **DELETE /api/portfolio/education/:id** - Delete education (Admin only)

#### Languages
- **GET /api/portfolio/languages** - Get languages
  - Response: `[{ name, proficiency }]`
  
- **PUT /api/portfolio/languages** - Update languages (Admin only)

### 3. Contact Form API
- **POST /api/contact** - Submit contact form
  - Request: `{ name, email, subject, message }`
  - Response: `{ success: true, message: "Message sent successfully" }`
  - Action: Save to DB + Send email notification

### 4. File Upload API
- **POST /api/upload/resume** - Upload resume PDF (Admin only)
  - Request: FormData with file
  - Response: `{ url: "/uploads/resume.pdf" }`
  
- **GET /api/upload/resume** - Download resume
  - Response: PDF file

## MongoDB Collections

### 1. users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (default: 'admin'),
  createdAt: Date
}
```

### 2. portfolio_info
```javascript
{
  _id: ObjectId,
  name: String,
  title: String,
  cgpa: String,
  email: String,
  phone: String,
  linkedin: String,
  github: String,
  profileImage: String,
  resumeUrl: String,
  updatedAt: Date
}
```

### 3. about
```javascript
{
  _id: ObjectId,
  description: String,
  interests: [String],
  qualities: [String],
  updatedAt: Date
}
```

### 4. skills
```javascript
{
  _id: ObjectId,
  name: String,
  level: Number,
  category: String,
  order: Number,
  createdAt: Date
}
```

### 5. projects
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  image: String,
  technologies: [String],
  githubUrl: String,
  liveUrl: String,
  featured: Boolean,
  award: String,
  order: Number,
  createdAt: Date
}
```

### 6. achievements
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  icon: String,
  year: String,
  order: Number,
  createdAt: Date
}
```

### 7. education
```javascript
{
  _id: ObjectId,
  degree: String,
  institution: String,
  duration: String,
  score: String,
  status: String,
  order: Number,
  createdAt: Date
}
```

### 8. languages
```javascript
{
  _id: ObjectId,
  name: String,
  proficiency: String,
  order: Number
}
```

### 9. contacts
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  subject: String,
  message: String,
  read: Boolean (default: false),
  createdAt: Date
}
```

## Frontend Integration Changes

### Files to Update:
1. **Hero.js** - Replace mock data with API call to `/api/portfolio/info`
2. **About.js** - Replace mock data with API call to `/api/portfolio/about`
3. **Skills.js** - Replace mock data with API call to `/api/portfolio/skills`
4. **Projects.js** - Replace mock data with API call to `/api/portfolio/projects`
5. **Achievements.js** - Replace mock data with API call to `/api/portfolio/achievements`
6. **Education.js** - Replace mock data with API calls to `/api/portfolio/education` and `/api/portfolio/languages`
7. **Contact.js** - Replace mock submission with API call to `/api/contact`

### New Files to Create:
1. **AuthContext.js** - Authentication state management
2. **Admin Dashboard** - CRUD interface for managing portfolio content
3. **ProtectedRoute.js** - Route protection for admin pages

## Email Configuration
- Service: Nodemailer with Gmail SMTP
- Environment variables needed:
  - EMAIL_USER
  - EMAIL_PASSWORD
  - ADMIN_EMAIL (recipient for contact form)

## Authentication Flow
1. Admin registers (one-time setup)
2. Admin logs in → receives JWT token
3. Token stored in localStorage
4. Protected routes check for valid token
5. Admin can CRUD all portfolio content

## Seed Data Strategy
- Create seed script to populate database with mock data from mock.js
- Run once during initial setup
- Admin can then modify through dashboard
