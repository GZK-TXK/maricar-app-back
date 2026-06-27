import nodemailer from "nodemailer"

export const contactController = {
    send: async (req, res) => {
        try {
            const { name, email, phone, carInfo, message } = req.body

            const testAccount = await nodemailer.createTestAccount()

            const transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            })

            const info = await transporter.sendMail({
                from: `"${name}" <${email}>`,
                to: "admin@maricar.com",
                subject: `Nueva reserva: ${carInfo}`,
                html: `
                    <h2>Solicitud de reserva</h2>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${phone}</p>
                    <p><strong>Coche:</strong> ${carInfo}</p>
                    <p><strong>Mensaje:</strong> ${message || "Sin mensaje"}</p>
                `,
            })

            console.log("Email preview URL:", nodemailer.getTestMessageUrl(info))

            res.json({ ok: true, msg: "Reserva enviada correctamente" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ ok: false, msg: "Error al enviar la reserva" })
        }
    }
}