import { Express } from "express";
import * as userRoutes from "./app";
import * as adminRoutes from "./admin";
import authorize from "@middleware/auth";

const registerUserRoutes = (app: Express) => {
  app.use("/auth", userRoutes.authRoutes);
  app.use("/contact", authorize(["user"]), userRoutes.contactRoutes);
  app.use("/profile", authorize(["user"]), userRoutes.profileRoutes);
};
const registerAdminRoutes = (app: Express) => {
  // app.use("/auth", adminRoutes.authRoutes);
};

export { registerUserRoutes, registerAdminRoutes };
