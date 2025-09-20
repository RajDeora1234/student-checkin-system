import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { routes } from "./routes/index.js";
import errorMiddleware from "./middleware/error.js";
import path from "path";
import { injectEnvVariables } from "./inject-env.js";

const app = express();
const PORT = process.env.PORT;
process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api", routes);

injectEnvVariables();

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "./frontend/dist")));

// Use middleware approach instead of route
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "./frontend/dist/index.html"), (err) => {
    if (err) next(err);
  });
});

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  console.error(`Shutting down the server due to Unhandled Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
