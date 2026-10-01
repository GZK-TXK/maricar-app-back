import { escapeHtml, stripNewlines } from "./emailUtils.js"

export const reservationEmail = ({ name, email, phone, carInfo, message }) => ({
    from: `"MariCar" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@maricar.com"}>`,
    replyTo: stripNewlines(email),
    to: process.env.EMAIL_TO || "admin@maricar.com",
    subject: `Nueva solicitud: ${stripNewlines(carInfo)}`,
    html: `
        <h2>Solicitud de reserva</h2>
        <table border="0" cellpadding="6" cellspacing="0">
            <tr><td><strong>Nombre:</strong></td><td>${escapeHtml(name)}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${escapeHtml(email)}</td></tr>
            <tr><td><strong>Teléfono:</strong></td><td>${escapeHtml(phone)}</td></tr>
            <tr><td><strong>Coche:</strong></td><td>${escapeHtml(carInfo)}</td></tr>
        </table>
        <p>${message ? escapeHtml(message) : "Sin mensaje"}</p>
    `
})