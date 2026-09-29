import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import carRoutes from "./routes/carRoutes.js"
import mongoConexion from "./config/db.js"
import { userRoutes } from "./routes/userRoutes.js"
import { authRoutes } from "./routes/authRoutes.js"
import { contactRoutes } from "./routes/contactRoutes.js"
import { reservationRoutes } from "./routes/reservationRoutes.js"
import { stripeWebhook } from "./controllers/stripeWebhookController.js"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

if (!process.env.JWT_SECRET) {
    console.error("FATAL: falta JWT_SECRET en el entorno")
    process.exit(1)
}

app.set("trust proxy", 1)
app.disable("x-powered-by")
app.use(helmet())

const whitelist = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map(url => url.trim()).filter(Boolean)
    : ["http://localhost:5173"]

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

app.use((req, res) => {
    res.status(404).json({ ok: false, msg: "Ruta no encontrada" })
})

app.use((err, req, res, next) => {
    console.error(err)
    if (err?.message === "Origen no permitido por CORS") {
        return res.status(403).json({ ok: false, msg: err.message })
    }
    if (err?.name === "MulterError") {
        return res.status(400).json({ ok: false, msg: `Error de subida: ${err.message}` })
    }
    if (typeof err?.message === "string" && err.message.startsWith("Solo imágenes")) {
        return res.status(400).json({ ok: false, msg: err.message })
    }
    res.status(500).json({ ok: false, msg: "Error interno del servidor" })
})

mongoConexion().catch(() => console.error("Error al conectar a la BDD"))

app.listen(port, () => {
    console.log(`Servidor a la escucha ${port}`)
})