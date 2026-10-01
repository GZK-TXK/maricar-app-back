import express from "express"
import rateLimit from "express-rate-limit"
import { authController } from "../controllers/authController.js"
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from "../middlewares/validations.js"
import { validateImputs } from "../middlewares/validateInputs.js"
import { authValidation } from "../middlewares/authValidation.js"

export const authRoutes = express.Router()

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, msg: "Demasiados intentos, prueba más tarde" },
})

authRoutes.post("/register", authLimiter, validateRegister, validateImputs, authController.register)
authRoutes.post("/login", authLimiter, validateLogin, validateImputs, authController.login)
authRoutes.get("/me", authValidation, authController.me)
authRoutes.post("/logout", authController.logout)
authRoutes.post("/forgot-password", authLimiter, validateForgotPassword, validateImputs, authController.forgotPassword)
authRoutes.post("/reset-password", authLimiter, validateResetPassword, validateImputs, authController.resetPassword)