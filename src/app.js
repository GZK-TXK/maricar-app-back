import "./config/env.js"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import carRoutes from "./routes/carRoutes.js"
import { userRoutes } from "./routes/userRoutes.js"
import { authRoutes } from "./routes/authRoutes.js"
import { contactRoutes } from "./routes/contactRoutes.js"
import { reservationRoutes } from "./routes/reservationRoutes.js"
import { adminRoutes } from "./routes/adminRoutes.js"
import { stripeWebhook } from "./controllers/stripeWebhookController.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { env } from "./config/env.js"
import swaggerUi from "swagger-ui-express"
import { openapiSpec } from "./docs/openapi.js"

export const createApp = () => {
    const app = express()

    app.set("trust proxy", 1)
    app.disable("x-powered-by")
    app.use(helmet())

    const whitelist = env.frontendUrl
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || whitelist.includes(origin)) return callback(null, true)
            return callback(new Error("Origen no permitido por CORS"))
        },
        credentials: true,
    }))

    // El webhook de Stripe necesita el body en crudo ANTES del parser JSON
    app.post("/api/v1/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook)

    app.use(express.json({ limit: "1mb" }))
    app.use(express.urlencoded({ extended: true, limit: "1mb" }))
    app.use(cookieParser())

    const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: { ok: false, msg: "Demasiadas peticiones, inténtalo más tarde" },
    })
    app.use(globalLimiter)

    // Mitigación CSRF: en métodos de escritura exige Origin permitido (si viene)
    const csrfOriginCheck = (req, res, next) => {
        if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next()
        const origin = req.headers.origin
        if (!origin) return next()
        if (whitelist.includes(origin)) return next()
        return res.status(403).json({ ok: false, msg: "Origen no permitido" })
    }
    app.use(csrfOriginCheck)

    app.get("/testapi", (req, res) => {
        res.send("API MariCar working")
    })

    app.use("/api/v1/cars", carRoutes)
    app.use("/api/v1/users", userRoutes)
    app.use("/api/v1/auth", authRoutes)
    app.use("/api/v1/contact", contactRoutes)
    app.use("/api/v1/reservations", reservationRoutes)
    app.use("/api/v1/admin", adminRoutes)

    // Documentación Swagger (CSP permisiva solo para esta ruta)
    app.use(
        "/api/docs",
        (req, res, next) => {
            res.setHeader(
                "Content-Security-Policy",
                "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"
            )
            next()
        },
        swaggerUi.serve,
        swaggerUi.setup(openapiSpec)
    )

    app.use((req, res) => {
        res.status(404).json({ ok: false, msg: "Ruta no encontrada" })
    })

    app.use(errorHandler)

    return app
}