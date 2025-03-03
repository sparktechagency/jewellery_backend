import { config } from "dotenv";
import express from "express";
import http from "http";
import { registerAdminRoutes } from "./routes";
import startDB from "./db";

config();
startDB();

const app = express();

app.use((req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const body =
    method === "POST" || method === "PUT" ? JSON.stringify(req.body) : null;

  console.log(`[${method}] ${url}${body ? ` body: ${body}` : ""}`);

  next();
});

app.use(express.json());
registerAdminRoutes(app);

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
