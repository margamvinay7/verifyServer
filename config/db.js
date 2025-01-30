import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "vidsagency",
    });
    console.log("database connected");
  } catch (error) {
    process.exit(1);
  }
}
