import { escapeHtml } from "./emailUtils.js"

export const passwordResetEmail = ({ user, resetUrl }) => ({
    from: `"MariCar" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@maricar.com"}>`,
    to: user.email,
    subject: "Restablece tu contraseña de MariCar",
    html: `
        <h2>Hola ${escapeHtml(user.name)}</h2>
        <p>Has solicitado restablecer tu contraseña. Pulsa el siguiente enlace (caduca en 1 hora):</p>
        <p><a href="${resetUrl}">Restablecer contraseña</a></p>
        <p>Si no has sido tú, ignora este mensaje y tu contraseña no cambiará.</p>
        <p>— Equipo MariCar</p>
    `
})