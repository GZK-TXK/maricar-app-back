import mongoose from "mongoose"
import Reservation from "../models/Reservation.js"
import Cars from "../models/Car.js"
import { stripe, getRedirectUrls } from "../config/stripe.js"
import { AppError } from "../utils/AppError.js"
import { getPagination, buildPagination, noPagination } from "../utils/pagination.js"

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const rangesOverlap = (aStart, aEnd, bStart, bEnd) => aStart <= bEnd && aEnd >= bStart

const hasBlockedRange = (car, start, end) =>
    (car.unavailableDates || []).some((r) =>
        rangesOverlap(new Date(r.start), new Date(r.end), start, end)
    )

const hasReservationConflict = (carId, start, end) =>
    Reservation.exists({
        car: carId,
        status: { $in: ["pending", "paid"] },
        startDate: { $lte: end },
        endDate: { $gte: start },
    })

const isOwnerOrAdmin = (reservation, user) => {
    if (user.role === "admin") return true
    const ownerId = reservation.user?.toString?.() ?? String(reservation.user)
    return ownerId === user.id
}

export const reservationService = {
    create: async ({ carId, startDate, endDate }, user) => {
        const start = new Date(startDate)
        const end = new Date(endDate)

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new AppError("Fechas inválidas", 400)
        }
        if (start >= end) {
            throw new AppError("La fecha de fin debe ser posterior a la de inicio", 400)
        }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (start < today) {
            throw new AppError("No puedes reservar fechas pasadas", 400)
        }

        const car = await Cars.findById(carId)
        if (!car) throw new AppError("Coche no encontrado", 404)
        if (!car.available) throw new AppError("El coche no está disponible para reservar", 400)
        if (hasBlockedRange(car, start, end)) throw new AppError("El coche ya está reservado en esas fechas", 409)
        if (await hasReservationConflict(car._id, start, end)) {
            throw new AppError("El coche ya tiene una reserva en esas fechas", 409)
        }

        const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
        const totalPrice = days * car.pricePerDay

        const reservation = await Reservation.create({
            user: user.id,
            car: car._id,
            startDate: start,
            endDate: end,
            days,
            pricePerDay: car.pricePerDay,
            totalPrice,
            status: "pending",
        })

        const { successUrl, cancelUrl } = getRedirectUrls()
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: `${car.brand} ${car.model}`,
                        images: car.imageUrl ? [car.imageUrl] : [],
                    },
                    unit_amount: Math.round(totalPrice * 100),
                },
                quantity: 1,
            }],
            customer_email: user.email,
            metadata: { reservationId: reservation._id.toString() },
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
        })

        reservation.stripeSessionId = session.id
        await reservation.save()

        return { reservation, checkoutUrl: session.url }
    },

    getMyReservations: async (userId) =>
        Reservation.find({ user: userId }).populate("car").sort({ createdAt: -1 }),

    getById: async (id, user) => {
        if (!isValidId(id)) throw new AppError("Id inválido", 400)
        const reservation = await Reservation.findById(id).populate("car")
        if (!reservation) throw new AppError("Reserva no encontrada", 404)
        if (!isOwnerOrAdmin(reservation, user)) throw new AppError("No autorizado", 403)
        return reservation
    },

    getBySession: async (sessionId, user) => {
        const reservation = await Reservation.findOne({ stripeSessionId: sessionId }).populate("car")
        if (!reservation) throw new AppError("Reserva no encontrada", 404)
        if (!isOwnerOrAdmin(reservation, user)) throw new AppError("No autorizado", 403)
        return reservation
    },

    getAll: async (query) => {
        const { paginate, page, limit } = getPagination(query)

        let q = Reservation.find({})
            .populate("car")
            .populate("user", "name surname email")
            .sort({ createdAt: -1 })

        if (paginate) {
            const total = await Reservation.countDocuments({})
            q = q.skip((page - 1) * limit).limit(limit)
            const reservations = await q
            return { reservations, pagination: buildPagination(page, limit, total) }
        }

        const reservations = await q
        return { reservations, pagination: noPagination(reservations.length) }
    },

    cancel: async (id, user) => {
        if (!isValidId(id)) throw new AppError("Id inválido", 400)

        const reservation = await Reservation.findById(id)
        if (!reservation) throw new AppError("Reserva no encontrada", 404)

        const isAdmin = user.role === "admin"
        if (!isOwnerOrAdmin(reservation, user)) throw new AppError("No autorizado", 403)

        if (reservation.status !== "paid") {
            throw new AppError("Solo se pueden cancelar reservas pagadas", 400)
        }

        if (!isAdmin) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (new Date(reservation.startDate) < today) {
                throw new AppError("No puedes cancelar una reserva que ya ha comenzado", 400)
            }
        }

        reservation.status = "cancelled"
        await reservation.save()

        const car = await Cars.findById(reservation.car)
        if (car) {
            car.unavailableDates = car.unavailableDates.filter((range) => {
                const start = new Date(range.start).getTime()
                const end = new Date(range.end).getTime()
                const rStart = new Date(reservation.startDate).getTime()
                const rEnd = new Date(reservation.endDate).getTime()
                return !(start === rStart && end === rEnd)
            })
            await car.save()
        }

        return reservation
    },
}