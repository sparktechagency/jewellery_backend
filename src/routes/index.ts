import { Express } from "express";
import * as userRoutes from "./app";
import * as adminRoutes from "./admin";

const registerUserRoutes = (app: Express) => {
  app.use("/auth", userRoutes.authRoutes);
};
const registerAdminRoutes = (app: Express) => {
  // app.use("/auth", adminRoutes.authRoutes);
};

export { registerUserRoutes, registerAdminRoutes };
