import { Express } from "express";
import * as userRoutes from "./app";
import * as adminRoutes from "./admin";

const registerUserRoutes = (app: Express) => {
  app.use("/auth", userRoutes.authRoutes);
  app.use("/contact", userRoutes.contactRoutes);
};
const registerAdminRoutes = (app: Express) => {
  // app.use("/auth", adminRoutes.authRoutes);
};

export { registerUserRoutes, registerAdminRoutes };
