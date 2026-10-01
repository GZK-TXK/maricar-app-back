import Reservation from '../models/Reservation.js'
import Cars from '../models/Car.js'
import User from '../models/User.js'
import nodemailer from 'nodemailer'
import { stripe } from '../config/stripe.js'
import { getTransporter } from '../config/email.js'
import { reservationConfirmationEmail } from '../templates/reservationConfirmationEmail.js'

const rangesOverlap = (aStart, aEnd, bStart, bEnd) => aStart <= bEnd && aEnd >= bStart

const sendConfirmation = async (reservation, car) => {
    try {
        const user = await User.findById(reservation.user)
        if (!user) return
        const transporter = await getTransporter()
        const info = await transporter.sendMail(reservationConfirmationEmail({ user, car, reservation }))
        const previewUrl = nodemailer.getTestMessageUrl(info)
        if (previewUrl) console.log('Email de confirmación (preview):', previewUrl)
    } catch (error) {
        console.error('Error al enviar el email de confirmación:', error.message)
    }
}

export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"]
    let event

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        console.error(error)
        return res.status(400).json({ ok: false, msg: `Webhook Error: ${error.message}` })
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object
            const reservationId = session.metadata?.reservationId

            if (!reservationId) {
                return res.json({ received: true })
            }

            const reservation = await Reservation.findById(reservationId)
            if (!reservation || reservation.status !== "pending") {
                return res.json({ received: true })
            }

            const car = await Cars.findById(reservation.car)
            if (!car) {
                reservation.status = "cancelled"
                await reservation.save()
                return res.json({ received: true })
            }

            const conflict = (car.unavailableDates || []).some(r =>
                rangesOverlap(new Date(r.start), new Date(r.end), reservation.startDate, reservation.endDate)
            )

            if (conflict) {
                // Carrera: ya no está libre → reembolsar y cancelar
                if (session.payment_intent) {
                    try {
                        await stripe.refunds.create({ payment_intent: session.payment_intent })
                    } catch (refundError) {
                        console.error('Error al reembolsar:', refundError.message)
                    }
                }
                reservation.status = "cancelled"
                await reservation.save()
                return res.json({ received: true })
            }

            reservation.status = "paid"
            reservation.stripePaymentIntentId = session.payment_intent
            await reservation.save()

            car.unavailableDates.push({
                start: reservation.startDate,
                end: reservation.endDate,
            })
            await car.save()

            await sendConfirmation(reservation, car)
        } else {
            console.log(`Unhandled event type ${event.type}`)
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ ok: false, msg: 'Error procesando el webhook' })
    }

    res.json({ received: true })
}