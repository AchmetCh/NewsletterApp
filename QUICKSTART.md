# 🚀 Quick Start Guide

Get your Newsletter Builder running in 5 minutes!

## Prerequisites Check ✓
```bash
node --version  # Should be v18 or higher
mongod --version  # Should be v6 or higher
```

## Step 1: Install Dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd ../client
npm install
```

## Step 2: Configure Environment

### Backend (.env)
```bash
cd ../server
cp .env.example .env
```

Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/newsletter-app
JWT_SECRET=change-this-to-a-random-secure-string
PORT=5000
NODE_ENV=development
SALT_ROUNDS=10
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

## Step 3: Start MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB

# Or run manually
mongod --dbpath /path/to/data/directory
```

## Step 4: Create Admin User
```bash
cd server
npm run create-admin

# Enter:
# Admin Email: admin@example.com
# Admin Password: your-secure-password
```

## Step 5: Start the Application

### Terminal 1 - Backend
```bash
cd server
npm run dev
```
✓ Backend running on http://localhost:5000

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```
✓ Frontend running on http://localhost:5173

## Step 6: Login & Test

1. Open http://localhost:5173
2. Login with your admin credentials
3. Create your first newsletter!

---

## Common Issues

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongo` or `mongosh`
- Check MONGO_URI in server/.env

### "401 Unauthorized" after login
- Clear browser cookies
- Restart both servers
- Check JWT_SECRET is set

### Images not uploading
- Check server/uploads/ folder exists
- Verify file is under 5MB
- Ensure it's an image (JPG, PNG, GIF, WebP)

### Frontend can't reach backend
- Verify backend is running on port 5000
- Check VITE_API_URL in client/.env
- Ensure CLIENT_URL in server/.env matches frontend

---

## 🎉 Success!

You should now have:
- ✓ Backend API running
- ✓ Frontend app running
- ✓ Admin user created
- ✓ MongoDB connected

**Next Steps:**
1. Login as admin
2. Create a user from Admin panel
3. Create your first newsletter
4. Test the email editor
5. Upload some images
6. Export HTML

**Need Help?** Check the main README.md for detailed documentation.
