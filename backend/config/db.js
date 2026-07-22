// This file handles the connection to MongoDB Atlas using Mongoose

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect using the connection string stored in the .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit the process with failure if the database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
