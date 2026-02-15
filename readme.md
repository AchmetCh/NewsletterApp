# Newsletter Builder - Full Stack MERN Application

A production-ready newsletter builder application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring JWT authentication with httpOnly cookies, role-based access control, and integrated email editor with image upload capabilities.

## 🚀 Features

- **Authentication**: Secure JWT-based auth with httpOnly cookies
- **Role-Based Access**: Admin and User roles with different permissions
- **Newsletter Editor**: Visual email editor powered by react-email-editor (Unlayer)
- **Image Upload**: Multer-powered image uploads with Sharp optimization
- **Image Processing**: Automatic resize, compress, and optimize with Sharp
- **Newsletter Management**: Create, edit, duplicate, and delete newsletters
- **User Management**: Admin panel for creating and managing users
- **Export**: Export newsletters as HTML files

## 📁 Project Structure

```
newsletter-app/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Database and Multer configuration
│   ├── controllers/       # Request handlers
│   ├── middlewares/       # Auth, role, and error middlewares
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── uploads/          # Uploaded images storage
│   ├── utils/            # Utility functions
│   ├── server.js         # Main server file
│   └── createAdmin.js    # Admin creation script
│
└── client/               # Frontend (React + Vite)
    ├── src/
    │   ├── api/         # API client functions
    │   ├── context/     # React Context (Auth)
    │   ├── pages/       # Page components
    │   ├── components/  # Reusable components
    │   ├── routes/      # Route protection
    │   ├── hooks/       # Custom hooks
    │   ├── layouts/     # Layout components
    │   ├── App.jsx      # Main app component
    │   └── main.jsx     # Entry point
    └── index.html
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **cookie-parser** - Cookie handling
- **Multer** - File uploads
- **Sharp** - Image processing & optimization
- **CORS** - Cross-origin requests

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **react-email-editor** - Email template editor
- **Context API** - State management

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd newsletter-app
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in the `server` directory:
```env
MONGO_URI=mongodb://localhost:27017/newsletter-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
SALT_ROUNDS=10
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Create First Admin User

```bash
cd ../server
npm run create-admin
```

Follow the prompts to create your admin account.

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Mode

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 🔐 Authentication Flow

1. **httpOnly Cookie**: JWT token stored in secure httpOnly cookie
2. **Automatic Sending**: Browser automatically sends cookie with every request
3. **No Manual Attachment**: No need to manually attach tokens to requests
4. **XSS Protection**: Token not accessible via JavaScript

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users (Admin Only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

### Newsletters
- `GET /api/newsletters` - Get all newsletters
- `GET /api/newsletters/:id` - Get newsletter by ID
- `POST /api/newsletters` - Create newsletter
- `PUT /api/newsletters/:id` - Update newsletter
- `DELETE /api/newsletters/:id` - Delete newsletter
- `POST /api/newsletters/:id/duplicate` - Duplicate newsletter

### Upload
- `POST /api/upload` - Upload image (multipart/form-data)

## 🗄️ Database Models

### User
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'user']),
  createdAt: Date
}
```

### Newsletter
```javascript
{
  title: String,
  month: String,
  year: Number,
  designJson: Object,
  html: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🖼️ Image Upload

Images are handled through:
1. User uploads image in email editor
2. react-email-editor triggers upload callback
3. Frontend sends to `/api/upload` via Multer
4. Backend receives and temporarily stores file
5. **Sharp processes the image:**
   - Resizes to max 1200x1200 (maintains aspect ratio)
   - Optimizes quality (85% for JPEG/PNG/WebP)
   - Converts to appropriate format
   - Reduces file size significantly
6. Original file deleted, optimized file kept
7. Returns public URL to frontend
8. URL inserted into email design

**Storage**: Files stored in `server/uploads/`
**Access**: Served statically at `/uploads/*`
**Limit**: 10MB per upload (optimized to much smaller)
**Types**: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
**Optimization**: Automatic via Sharp
**Output**: Max 1200x1200px, 85% quality

## 🛡️ Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Authentication**: Secure token-based auth
- **httpOnly Cookies**: XSS-protected token storage
- **Role-Based Access**: Admin and user permissions
- **File Type Validation**: Only images allowed
- **File Size Limits**: 5MB maximum
- **CORS Configuration**: Whitelisted origins only
- **Error Handling**: Comprehensive error middleware

## 👥 User Roles

### Admin
- Create/delete users
- Full newsletter access
- User management panel

### User
- Create newsletters
- Edit own newsletters
- View all newsletters
- Upload images

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | - |
| JWT_SECRET | Secret for JWT signing | - |
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| SALT_ROUNDS | bcrypt salt rounds | 10 |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |

### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000 |

## 🎨 Frontend Pages

- **/login** - Authentication page
- **/dashboard** - Newsletter list and management
- **/editor/:id** - Visual newsletter editor
- **/admin** - User management (admin only)

## 📝 Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run create-admin  # Create admin user
```

### Frontend
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Verify network connectivity

### Cookie Not Sent
- Ensure `withCredentials: true` in Axios
- Check CORS configuration
- Verify CLIENT_URL matches frontend URL

### Image Upload Fails
- Check uploads/ folder permissions
- Verify file size under 10MB
- Ensure correct image MIME type
- Check Sharp installation: `npm list sharp`
- On some systems, Sharp may need rebuild: `npm rebuild sharp`

### 401 Unauthorized
- Clear browser cookies
- Re-login
- Check JWT_SECRET matches between server instances

## 📦 Deployment Considerations

1. **Environment Variables**: Set all production values
2. **NODE_ENV**: Set to `production`
3. **MongoDB**: Use MongoDB Atlas or hosted instance
4. **File Storage**: Consider cloud storage (S3, Cloudinary) for production
5. **HTTPS**: Enable secure cookies with `secure: true`
6. **CORS**: Update CLIENT_URL to production domain

## 🤝 Contributing

This is an MVP project. Keep it simple and avoid:
- SSO integration
- Approval workflows
- Version history
- Email sending
- Analytics

## 📄 License

ISC

---

## 📖 Additional Documentation

- **[SHARP.md](./SHARP.md)** - Complete Sharp image processing guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[QUICKSTART.md](./QUICKSTART.md)** - Fast 5-minute setup guide

## 👤 Author

Built following strict MVP principles for internal newsletter management.
