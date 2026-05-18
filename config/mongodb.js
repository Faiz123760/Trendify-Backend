import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.log("MongoDB connection error:", err);
  });

  try {
    const url = process.env.MONGODB_URL;
    if (!url) {
      throw new Error("MONGODB_URL is not defined in environment variables");
    }
    
    const options = {
      serverSelectionTimeoutMS: 30000, 
      socketTimeoutMS: 45000,         
      family: 4                       
    };

    await mongoose.connect(`${url}/trendify`, options);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    // process.exit(1); 
  }
};

export default connectDB;
