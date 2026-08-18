import Reservation from '../models/Reservation.js'
import Cars from '../models/Car.js'
import { stripe, getRedirectUrls } from '../config/stripe.js'

const hasDateConflict = (car, startDate, endDate) => {
    return car.unavailableDates.some(range => {
        const start = new Date(range.start)
        const end = new Date(range.end)
        return startDate <= end && endDate >= start
    })
}

export const reservationController = {

    create: async (req, res) => {
        try {
            const { carId, startDate, endDate } = req.body

            const start = new Date(startDate)
            const end = new Date(endDate)

            if (start >= end) {
                return res.status(400).json({ ok: false, msg: 'La fecha de fin debe ser posterior a la de inicio' })
            }

            const car = await Cars.findById(carId)
            if (!car) {
                return res.status(404).json({ ok: false, msg: 'Coche no encontrado' })
            }
            if (!car.available) {
                return res.status(400).json({ ok: false, msg: 'El coche no está disponible para reservar' })
            }
            if (hasDateConflict(car, start, end)) {
                return res.status(409).json({ ok: false, msg: 'El coche ya está reservado en esas fechas' })
            }

            const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
            const totalPrice = days * car.pricePerDay

            const reservation = await Reservation.create({
                user: req.user.id,
                car: car._id,
                startDate: start,
                endDate: end,
                days,
                pricePerDay: car.pricePerDay,
                totalPrice,
                status: 'pending',
            })

            const { successUrl, cancelUrl } = getRedirectUrls()
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [{
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `${car.brand} ${car.model}`,
                            images: car.imageUrl ? [car.imageUrl] : [],
                        },
                        unit_amount: Math.round(totalPrice * 100),
                    },
                    quantity: 1,
                }],
                customer_email: req.user.email,
                metadata: { reservationId: reservation._id.toString() },
                success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl,
            })

            reservation.stripeSessionId = session.id
            await reservation.save()

            res.status(201).json({
                ok: true,
                msg: 'Reserva creada, completa el pago',
                data: { reservation, checkoutUrl: session.url }
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ ok: false, msg: 'Error al crear la reserva' })
        }
    },

    getMyReservations: async (req, res) => {
        try {
            const reservations = await Reservation.find({ user: req.user.id })
                .populate('car')
                .sort({ createdAt: -1 })
            res.status(200).json({ ok: true, msg: 'Obteniendo tus reservas', data: reservations })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al obtener tus reservas' })
        }
    },

    getBySession: async (req, res) => {
        try {
            const reservation = await Reservation.findOne({ stripeSessionId: req.params.sessionId })
                .populate('car')
            if (!reservation) {
                return res.status(404).json({ ok: false, msg: 'Reserva no encontrada' })
            }
            res.status(200).json({ ok: true, msg: 'Obteniendo reserva', data: reservation })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al obtener la reserva' })
        }
    },

    getAll: async (req, res) => {
        try {
            const reservations = await Reservation.find({})
                .populate('car')
                .populate('user', 'name surname email')
                .sort({ createdAt: -1 })
            res.status(200).json({ ok: true, msg: 'Obteniendo reservas', data: reservations })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al obtener las reservas' })
        }
    },

    cancel: async (req, res) => {
        try {
            const reservation = await Reservation.findById(req.params.id)
            if (!reservation) {
                return res.status(404).json({ ok: false, msg: 'Reserva no encontrada' })
            }
            if (reservation.status !== 'paid') {
                return res.status(400).json({ ok: false, msg: 'Solo se pueden cancelar reservas pagadas' })
            }
            reservation.status = 'cancelled'
            await reservation.save()

            const car = await Cars.findById(reservation.car)
            if (car) {
                car.unavailableDates = car.unavailableDates.filter(range => {
                    const start = new Date(range.start).getTime()
                    const end = new Date(range.end).getTime()
                    const rStart = new Date(reservation.startDate).getTime()
                    const rEnd = new Date(reservation.endDate).getTime()
                    return !(start === rStart && end === rEnd)
                })
                await car.save()
            }

            res.status(200).json({ ok: true, msg: 'Reserva cancelada', data: reservation })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al cancelar la reserva' })
        }
    }
}