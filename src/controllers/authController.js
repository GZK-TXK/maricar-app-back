import { authService } from "../services/authService.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { env } from "../config/env.js"

const COOKIE_NAME = "token"
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const cookieOptions = () => ({
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
})

export const authController = {
    register: asyncHandler(async (req, res) => {
        const { user, token } = await authService.register(req.body)
        res.cookie(COOKIE_NAME, token, cookieOptions())
        res.status(201).json({ ok: true, msg: "Usuario registrado correctamente", data: { user } })
    }),

    login: asyncHandler(async (req, res) => {
        const { user, token } = await authService.login(req.body.email, req.body.password)
        res.cookie(COOKIE_NAME, token, cookieOptions())
        res.json({ ok: true, msg: "Inicio de sesión correcto", data: { user } })
    }),

    me: asyncHandler(async (req, res) => {
        const user = await authService.getMe(req.user.id)
        res.json({ ok: true, data: user })
    }),

    logout: (req, res) => {
        res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined })
        res.json({ ok: true, msg: "Sesión cerrada" })
    },

    forgotPassword: asyncHandler(async (req, res) => {
        await authService.forgotPassword(req.body.email)
        res.json({ ok: true, msg: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" })
    }),

    resetPassword: asyncHandler(async (req, res) => {
        await authService.resetPassword(req.body.token, req.body.password)
        res.json({ ok: true, msg: "Contraseña actualizada correctamente" })
    }),
}