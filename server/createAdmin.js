require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Get admin details
    console.log('\n📝 Create Admin User\n');
    
    const email = await question('Admin Email: ');
    const password = await question('Admin Password: ');

    // Validate inputs
    if (!email || !password) {
      console.log('❌ Email and password are required');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      email,
      password,
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin._id}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Run the script
createAdmin();
