import dotenv from "dotenv"

dotenv.config()

const required = ["JWT_SECRET", "MONGODB_URI", "STRIPE_SECRET_KEY"]
const missing = required.filter((key) => !process.env[key])

if (missing.length > 0) {
    console.error(`FATAL: faltan variables de entorno obligatorias: ${missing.join(", ")}`)
    process.exit(1)
}

const isProd = process.env.NODE_ENV === "production"

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProd,
    port: Number(process.env.PORT) || 3000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    email: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@maricar.com",
        to: process.env.EMAIL_TO || "admin@maricar.com",
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
}