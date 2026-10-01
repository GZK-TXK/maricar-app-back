import { escapeHtml, formatDate, formatPrice } from "./emailUtils.js"

export const reservationConfirmationEmail = ({ user, car, reservation }) => ({
    from: `"MariCar" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@maricar.com"}>`,
    to: user.email,
    subject: `Reserva confirmada: ${escapeHtml(car.brand)} ${escapeHtml(car.model)}`,
    html: `
        <h2>¡Gracias por tu reserva, ${escapeHtml(user.name)}!</h2>
        <p>Hemos recibido tu pago correctamente. Este es el resumen de tu reserva:</p>
        <table border="0" cellpadding="6" cellspacing="0">
            <tr><td><strong>Vehículo:</strong></td><td>${escapeHtml(car.brand)} ${escapeHtml(car.model)} (${escapeHtml(car.plate)})</td></tr>
            <tr><td><strong>Desde:</strong></td><td>${formatDate(reservation.startDate)}</td></tr>
            <tr><td><strong>Hasta:</strong></td><td>${formatDate(reservation.endDate)}</td></tr>
            <tr><td><strong>Días:</strong></td><td>${reservation.days}</td></tr>
            <tr><td><strong>Precio/día:</strong></td><td>${formatPrice(reservation.pricePerDay)}</td></tr>
            <tr><td><strong>Total:</strong></td><td><strong>${formatPrice(reservation.totalPrice)}</strong></td></tr>
            <tr><td><strong>Referencia:</strong></td><td>${reservation._id}</td></tr>
        </table>
        <p>Si necesitas modificar o cancelar tu reserva, responde a este correo.</p>
        <p>— Equipo MariCar</p>
    `
})