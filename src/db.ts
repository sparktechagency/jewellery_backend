import seedingAdmin from "@services/seeding";
import mongoose from "mongoose";

const startDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || "");
  await seedingAdmin();
  console.log("MongoDB Connected");
};

export default startDB;
