import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/User.js"
import { env } from "../config/env.js"
import { AppError } from "../utils/AppError.js"
import { getTransporter } from "../config/email.js"
import { passwordResetEmail } from "../templates/passwordResetEmail.js"

const frontendUrl = env.frontendUrl.split(",")[0].trim()

const signToken = (user) => jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
)

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
})

export const authService = {
    register: async (body) => {
        const { name, surname, email, password, direction, birthday, phone } = body

        const existUser = await User.findOne({ email }).lean()
        if (existUser) throw new AppError("Email ya registrado", 409)

        const user = new User({ name, surname, email, password, direction, birthday, phone })
        await user.save()

        return { user: publicUser(user), token: signToken(user) }
    },

    login: async (email, password) => {
        const user = await User.findOne({ email }).select("+password")
        if (!user) throw new AppError("Credenciales inválidas", 401)

        const isMatch = await user.comparePassword(password)
        if (!isMatch) throw new AppError("Credenciales inválidas", 401)

        return { user: publicUser(user), token: signToken(user) }
    },

    getMe: async (userId) => {
        const user = await User.findById(userId).select("name surname email role birthday direction phone")
        if (!user) throw new AppError("Usuario no encontrado", 404)

        return {
            id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            birthday: user.birthday,
            direction: user.direction,
            phone: user.phone,
        }
    },

    forgotPassword: async (email) => {
        const user = await User.findOne({ email })
        if (!user) return

        const rawToken = crypto.randomBytes(32).toString("hex")
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")

        user.resetPasswordToken = hashedToken
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000
        await user.save()

        const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`
        try {
            const transporter = await getTransporter()
            await transporter.sendMail(passwordResetEmail({ user, resetUrl }))
        } catch (emailError) {
            console.error("Error al enviar el email de reset:", emailError.message)
        }
    },

    resetPassword: async (token, password) => {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        })
        if (!user) throw new AppError("Token inválido o expirado", 400)

        user.password = password
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()
    },
}