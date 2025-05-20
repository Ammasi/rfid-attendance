import mongoose from "mongoose";

const connect = async () => {
  try {
    const mongoURI = process.env.MONGODB;
    if (!mongoURI) {
      throw new Error("MongoDB URI is not defined in .env");
    }
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (error: any) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connect;