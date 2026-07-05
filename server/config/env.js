const REQUIRED_ENV = [
  "MONGODB_URL",
  "JWT_SECRET",
  "OPENROUTER_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

export const validateEnv = () => {
  const missing = REQUIRED_ENV.filter(
    (key) => !process.env[key] || process.env[key].trim() === ""
  );

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }
};

export const getClientOrigins = () =>
  (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const isProduction = () => process.env.NODE_ENV === "production";
