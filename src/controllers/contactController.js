import nodemailer from "nodemailer"
import { getTransporter } from "../config/email.js"
import { reservationEmail } from "../templates/reservationEmail.js"

export const contactController = {
    send: async (req, res) => {
        try {
            const transporter = await getTransporter()
            const info = await transporter.sendMail(reservationEmail(req.body))
            console.log("Email preview URL:", nodemailer.getTestMessageUrl(info))
            res.json({ ok: true, msg: "Reserva enviada correctamente" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ ok: false, msg: "Error al enviar la reserva" })
        }
    }
}