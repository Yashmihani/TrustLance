const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;