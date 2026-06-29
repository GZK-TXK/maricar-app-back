export const reservationEmail = ({ name, email, phone, carInfo, message }) => ({
    from: `"${name}" <${email}>`,
    to: "admin@maricar.com",
    subject: `Nueva reserva: ${carInfo}`,
    html: `
        <h2>Solicitud de reserva</h2>
        <table border="0" cellpadding="6" cellspacing="0">
            <tr><td><strong>Nombre:</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
            <tr><td><strong>Teléfono:</strong></td><td>${phone}</td></tr>
            <tr><td><strong>Coche:</strong></td><td>${carInfo}</td></tr>
        </table>
        <p>${message || "Sin mensaje"}</p>
    `
})