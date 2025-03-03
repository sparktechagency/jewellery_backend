import { Express } from "express";
import * as adminRoutes from "./admin";

const registerAdminRoutes = (app: Express) => {
  app.use("/auth", adminRoutes.authRoutes);
};

export { registerAdminRoutes };
