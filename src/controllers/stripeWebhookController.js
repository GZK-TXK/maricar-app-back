import Reservation from '../models/Reservation.js'
import Cars from '../models/Car.js'
import { stripe } from '../config/stripe.js'

export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"]
    let event

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        console.log(error)
        return res.status(400).json({ ok: false, msg: `Webhook Error: ${error.message}` })
    }

    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object
            const reservationId = session.metadata.reservationId

            const reservation = await Reservation.findById(reservationId)
            if (reservation && reservation.status === "pending") {
                reservation.status = "paid"
                reservation.stripePaymentIntentId = session.payment_intent
                await reservation.save()

                const car = await Cars.findById(reservation.car)
                if (car) {
                    car.unavailableDates.push({
                        start: reservation.startDate,
                        end: reservation.endDate,
                    })
                    await car.save()
                }
            }
            break
        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
}