import { plainPasswordToHash } from "@utils/password";
import { config } from "dotenv";
import { User } from "src/schema";

config();

const seedingAdmin = async () => {
  try {
    // at first check if the admin exist of not
    const admin = await User.findOne({
      role: "admin",
      email: process.env.ADMIN_EMAIL,
    });
    if (!admin) {
      const password_hash = await plainPasswordToHash(
        process.env.ADMIN_PASSWORD!
      );
      await User.create({
        name: "Super Admin",
        role: "admin",
        email: process.env.ADMIN_EMAIL,
        password_hash: password_hash,
        emailVerified: true,
      });
    }
  } catch (error) {
    console.log("Error seeding super admin");
    console.log(error);
  }
};

export default seedingAdmin;
