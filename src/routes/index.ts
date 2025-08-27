import { Express } from "express";
import * as userRoutes from "./app";
import * as adminRoutes from "./admin";
import webhookRoutes from "./webhook.routes";
import authorize from "@middleware/auth";

const registerUserRoutes = (app: Express) => {
  app.use("/auth", userRoutes.authRoutes);
  app.use("/contact", userRoutes.contactRoutes);
  app.use("/profile", authorize(["user", "admin"]), userRoutes.profileRoutes);
  app.use("/categories", userRoutes.categoriesRoutes);
  app.use("/info", userRoutes.infoRoutes);
  app.use("/orders", userRoutes.ordersRoutes);
  app.use("/appointment", userRoutes.appointmentRoutes);
  app.use("/products", userRoutes.productsRoutes);
  app.use("/faq", userRoutes.faqRoutes);
  app.use(
    "/contact-details",
    adminRoutes.manageContactRoutes
  );
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
  app.use("/admin/users", authorize(["admin"]), adminRoutes.usersRoutes);
  app.use("/admin/contact", authorize(["admin"]), adminRoutes.contactRoutes);
  app.use("/admin/faq", authorize(["admin"]), adminRoutes.faqRoutes);
  app.use(
    "/admin/dashboard",
    authorize(["admin"]),
    adminRoutes.dashboardRoutes
  );
  app.use(
    "/admin/manage-contact",
    authorize(["admin"]),
    adminRoutes.manageContactRoutes
  );
};

const registerWebhookRoutes = (app: Express) => {
  app.use("/webhook", webhookRoutes);
};

export { registerUserRoutes, registerAdminRoutes, registerWebhookRoutes };
