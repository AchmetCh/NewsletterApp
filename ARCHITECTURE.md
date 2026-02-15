# 🏗️ Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React + Vite)                   │
│  ┌────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │   Pages    │  │  Components │  │  Context (Auth)   │   │
│  │            │  │             │  │                   │   │
│  │ - Login    │  │ - Layout    │  │ - User State     │   │
│  │ - Dashboard│  │ - Modals    │  │ - Auth Methods   │   │
│  │ - Editor   │  │ - Protected │  │                   │   │
│  │ - Admin    │  │   Routes    │  │                   │   │
│  └────────────┘  └─────────────┘  └───────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │              API Layer (Axios)                        │   │
│  │  - withCredentials: true (sends cookies)             │   │
│  │  - Automatic 401 handling                            │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP + Cookies
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  SERVER (Node.js + Express)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Middlewares                        │  │
│  │  - CORS (credentials: true)                          │  │
│  │  - Cookie Parser                                     │  │
│  │  - Auth Middleware (JWT validation)                  │  │
│  │  - Role Middleware (admin/user check)                │  │
│  │  - Multer (file uploads)                             │  │
│  │  - Error Handler                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                      Routes                           │  │
│  │  - /api/auth/*                                       │  │
│  │  - /api/users/* (admin only)                         │  │
│  │  - /api/newsletters/*                                │  │
│  │  - /api/upload                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Controllers                         │  │
│  │  - Business Logic                                    │  │
│  │  - Request/Response Handling                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Models (Mongoose)                    │  │
│  │  - User                                              │  │
│  │  - Newsletter                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Protocol
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  ┌─────────────────┐         ┌──────────────────────┐      │
│  │  users          │         │  newsletters         │      │
│  │  - email        │         │  - title             │      │
│  │  - password     │         │  - month             │      │
│  │  - role         │         │  - year              │      │
│  │  - createdAt    │         │  - designJson        │      │
│  └─────────────────┘         │  - html              │      │
│                              │  - createdBy (ref)   │      │
│                              │  - createdAt         │      │
│                              │  - updatedAt         │      │
│                              └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
1. User Login
   ┌─────────┐                    ┌─────────┐
   │ Client  │ POST /api/auth/login│ Server  │
   │         ├──────────────────>│         │
   │         │ { email, password }│         │
   │         │                    │         │
   │         │    Set-Cookie:      │         │
   │         │<──────────────────┤         │
   │         │ token=JWT; httpOnly│         │
   └─────────┘                    └─────────┘

2. Authenticated Request
   ┌─────────┐                    ┌─────────┐
   │ Client  │ GET /api/newsletters│ Server  │
   │         ├──────────────────>│         │
   │         │ Cookie: token=JWT  │         │
   │         │                    │ Verify  │
   │         │                    │  JWT    │
   │         │    Response        │         │
   │         │<──────────────────┤         │
   └─────────┘                    └─────────┘

3. Logout
   ┌─────────┐                    ┌─────────┐
   │ Client  │POST /api/auth/logout│ Server  │
   │         ├──────────────────>│         │
   │         │                    │         │
   │         │   Clear Cookie     │         │
   │         │<──────────────────┤         │
   │         │                    │         │
   └─────────┘                    └─────────┘
```

## Image Upload Flow

```
┌──────────────┐                              ┌──────────────┐
│  Email       │                              │   Server     │
│  Editor      │                              │              │
└──────┬───────┘                              └──────┬───────┘
       │                                             │
       │ 1. User inserts image                      │
       │                                             │
       │ 2. Editor triggers upload callback         │
       │                                             │
       │ 3. Frontend: uploadAPI.uploadImage(file)   │
       ├────────────────────────────────────────────>│
       │    POST /api/upload                        │
       │    FormData: { image: file }               │
       │                                             │
       │                                  4. Multer receives file
       │                                  5. Save temporarily
       │                                  6. Sharp processes:
       │                                     - Resize (max 1200x1200)
       │                                     - Optimize quality (85%)
       │                                     - Convert format
       │                                  7. Delete original
       │                                  8. Keep optimized
       │                                  9. Generate URL
       │                                             │
       │ 10. Return URL                             │
       │<────────────────────────────────────────────┤
       │    { url: "http://.../image-optimized.jpg" }│
       │                                             │
       │ 11. Insert URL into editor                 │
       │                                             │
```

## Folder Structure Details

### Backend (server/)

```
server/
├── config/
│   ├── db.js              # MongoDB connection
│   └── multer.js          # File upload configuration
│
├── controllers/
│   ├── authController.js       # Login, logout, getMe
│   ├── userController.js       # CRUD for users (admin)
│   ├── newsletterController.js # CRUD + duplicate
│   └── uploadController.js     # Image upload handler
│
├── middlewares/
│   ├── authMiddleware.js      # JWT verification
│   ├── roleMiddleware.js      # Role-based access
│   └── errorHandler.js        # Global error handling
│
├── models/
│   ├── User.js               # User schema
│   └── Newsletter.js         # Newsletter schema
│
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── userRoutes.js         # User management (admin)
│   ├── newsletterRoutes.js   # Newsletter CRUD
│   └── uploadRoutes.js       # Image upload
│
├── uploads/                  # Uploaded images storage
│   └── .gitkeep
│
├── server.js                 # Main server file
├── createAdmin.js            # Admin creation script
├── package.json
└── .env
```

### Frontend (client/)

```
client/
├── src/
│   ├── api/
│   │   ├── axios.js          # Axios instance with cookies
│   │   ├── auth.js           # Auth API calls
│   │   ├── users.js          # User API calls
│   │   ├── newsletters.js    # Newsletter API calls
│   │   └── upload.js         # Upload API call
│   │
│   ├── context/
│   │   └── AuthContext.jsx   # Global auth state
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx    # Navigation + content wrapper
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx     # Login form
│   │   ├── DashboardPage.jsx # Newsletter list
│   │   ├── EditorPage.jsx    # Email editor
│   │   └── AdminPage.jsx     # User management
│   │
│   ├── routes/
│   │   └── ProtectedRoute.jsx # Route protection HOC
│   │
│   ├── App.jsx               # Main app + routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
│
├── index.html
├── vite.config.js
├── package.json
└── .env
```

## Data Flow Examples

### Creating a Newsletter

```
User Action: Click "Create Newsletter" → Fill form → Submit

1. DashboardPage.jsx
   └─> newsletterAPI.create({ title, month, year })

2. client/src/api/newsletters.js
   └─> api.post('/api/newsletters', data)
   
3. server/routes/newsletterRoutes.js
   └─> POST / → authMiddleware → createNewsletter

4. server/controllers/newsletterController.js
   └─> Newsletter.create({ ...data, createdBy: req.user._id })

5. MongoDB
   └─> Insert document into newsletters collection

6. Response flows back up the chain

7. Navigate to EditorPage
```

### Editing a Newsletter

```
User Action: Edit newsletter → Save

1. EditorPage.jsx
   └─> emailEditorRef.exportHtml() → get design + html
   └─> newsletterAPI.update(id, { designJson, html })

2. server/controllers/newsletterController.js
   └─> Newsletter.findById(id) → update fields → save()

3. MongoDB
   └─> Update document with new designJson and html

4. Success response
```

### Admin Creating User

```
User Action: Admin → Create User → Fill form → Submit

1. AdminPage.jsx
   └─> userAPI.create({ email, password, role })

2. server/routes/userRoutes.js
   └─> authMiddleware → roleMiddleware('admin') → createUser

3. server/controllers/userController.js
   └─> Check if exists → User.create()

4. server/models/User.js (pre-save hook)
   └─> Hash password with bcrypt

5. MongoDB
   └─> Insert user document

6. Response with new user (password excluded)
```

## Security Layers

```
┌──────────────────────────────────────────────────────┐
│ Layer 1: Frontend Protection                         │
│ - ProtectedRoute checks authentication               │
│ - Admin routes check role                            │
│ - 401 interceptor redirects to login                 │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│ Layer 2: Network Security                            │
│ - httpOnly cookies (XSS protection)                  │
│ - SameSite: strict (CSRF protection)                 │
│ - CORS with credentials                              │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│ Layer 3: Backend Authentication                      │
│ - authMiddleware verifies JWT from cookie            │
│ - Rejects invalid/expired tokens                     │
│ - Attaches user to request                           │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│ Layer 4: Authorization                               │
│ - roleMiddleware checks user.role                    │
│ - Enforces admin-only endpoints                      │
│ - Prevents privilege escalation                      │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│ Layer 5: Data Validation                             │
│ - Mongoose schema validation                         │
│ - Multer file type/size validation                   │
│ - Controller-level input validation                  │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│ Layer 6: Error Handling                              │
│ - Global error handler middleware                    │
│ - No sensitive info in error messages                │
│ - Proper HTTP status codes                           │
└──────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Why httpOnly Cookies?
- **Security**: Not accessible via JavaScript (XSS protection)
- **Automatic**: Browser handles sending
- **Stateless**: Server verifies each request independently

### Why JWT?
- **Stateless**: No session storage needed
- **Scalable**: Works across multiple servers
- **Standard**: Industry-standard authentication

### Why Multer + Sharp + Local Storage?
- **Simple**: No external dependencies for MVP
- **Fast**: Direct filesystem access
- **Optimized**: Sharp automatically compresses images
- **Quality**: Maintains visual quality while reducing size
- **Flexible**: Supports all common image formats
- **Migration Path**: Easy to swap for cloud storage later (S3 + Lambda with Sharp)

### Why react-email-editor?
- **Visual**: No HTML/CSS knowledge needed
- **Export**: Clean HTML output
- **Customizable**: Supports image uploads

### Why Role-Based Access?
- **Simple**: Only 2 roles (admin/user)
- **Clear**: Permissions are explicit
- **Enforceable**: Both frontend and backend

## Performance Considerations

### Backend
- Connection pooling in Mongoose
- Static file serving with Express
- Middleware ordering (fast paths first)

### Frontend
- Code splitting with React Router
- Lazy loading for editor
- Optimistic UI updates

### Database
- Indexes on frequently queried fields (email, createdBy)
- Lean queries where population not needed
- Pagination for large lists (implement when needed)

## Scalability Notes

**Current Design**: Single server, suitable for <100 users

**To Scale:**
1. Add Redis for session caching
2. Move uploads to S3/Cloudinary
3. Add database read replicas
4. Implement CDN for static assets
5. Add load balancer for multiple servers

## Testing Strategy (Not Implemented - MVP)

**Unit Tests:**
- Controllers
- Middlewares
- Models (validation)

**Integration Tests:**
- API endpoints
- Authentication flow
- File uploads

**E2E Tests:**
- User flows
- Admin operations
- Newsletter creation/editing
