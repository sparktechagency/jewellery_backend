import { Express } from "express";
import * as userRoutes from "./app";
import * as adminRoutes from "./admin";
import authorize from "@middleware/auth";

const registerUserRoutes = (app: Express) => {
  app.use("/auth", userRoutes.authRoutes);
  app.use("/contact", userRoutes.contactRoutes);
  app.use("/profile", authorize(["user"]), userRoutes.profileRoutes);
  app.use("/favorites", authorize(["user"]), userRoutes.favoritesRoutes);
  app.use("/categories", userRoutes.categoriesRoutes);
  app.use("/info", userRoutes.infoRoutes);
};
const registerAdminRoutes = (app: Express) => {
  app.use(
    "/admin/categories",
    authorize(["admin"]),
    adminRoutes.categoriesRoutes
  );
  app.use("/admin/info", authorize(["admin"]), adminRoutes.infoRoutes);
};

export { registerUserRoutes, registerAdminRoutes };
