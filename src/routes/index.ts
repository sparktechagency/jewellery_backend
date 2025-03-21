import { Express } from "express";
import * as userRoutes from "./app";
import * as adminRoutes from "./admin";
import authorize from "@middleware/auth";

const registerUserRoutes = (app: Express) => {
  app.use("/auth", userRoutes.authRoutes);
  app.use("/contact", userRoutes.contactRoutes);
  app.use("/profile", authorize(["user"]), userRoutes.profileRoutes);
  app.use("/categories", userRoutes.categoriesRoutes);
  app.use("/info", userRoutes.infoRoutes);
  app.use("/orders", userRoutes.ordersRoutes);
  app.use("/appointment", userRoutes.appointmentRoutes);
  app.use("/products", userRoutes.productsRoutes);
};
const registerAdminRoutes = (app: Express) => {
  app.use(
    "/admin/categories",
    authorize(["admin"]),
    adminRoutes.categoriesRoutes
  );
  app.use("/admin/info", authorize(["admin"]), adminRoutes.infoRoutes);
  app.use(
    "/admin/appointment",
    authorize(["admin"]),
    adminRoutes.appointmentRoutes
  );
  app.use("/admin/products", authorize(["admin"]), adminRoutes.productsRoutes);
  app.use("/admin/orders", authorize(["admin"]), adminRoutes.ordersRoutes);
};

export { registerUserRoutes, registerAdminRoutes };
