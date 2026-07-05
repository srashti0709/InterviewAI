import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import connectDb from "./config/connectDb.js";
import { getClientOrigins, isProduction, validateEnv } from "./config/env.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";

dotenv.config();
validateEnv();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uploadDir = path.join(process.cwd(), "public");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

if (isProduction()) {
  app.set("trust proxy", 1);
}

const allowedOrigins = getClientOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.message?.includes("not allowed by CORS")) {
    return res.status(403).json({ message: err.message });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    message: isProduction() ? "Internal server error" : err.message,
  });
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
