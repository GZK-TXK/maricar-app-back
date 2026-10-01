import { reservationService } from "../services/reservationService.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const reservationController = {
    create: asyncHandler(async (req, res) => {
        const data = await reservationService.create(req.body, req.user)
        res.status(201).json({ ok: true, msg: "Reserva creada, completa el pago", data })
    }),

    getMyReservations: asyncHandler(async (req, res) => {
        const reservations = await reservationService.getMyReservations(req.user.id)
        res.status(200).json({ ok: true, msg: "Obteniendo tus reservas", data: reservations })
    }),

    getOne: asyncHandler(async (req, res) => {
        const reservation = await reservationService.getById(req.params.id, req.user)
        res.status(200).json({ ok: true, msg: "Obteniendo reserva", data: reservation })
    }),

    getBySession: asyncHandler(async (req, res) => {
        const reservation = await reservationService.getBySession(req.params.sessionId, req.user)
        res.status(200).json({ ok: true, msg: "Obteniendo reserva", data: reservation })
    }),

    getAll: asyncHandler(async (req, res) => {
        const { reservations, pagination } = await reservationService.getAll(req.query)
        res.status(200).json({ ok: true, msg: "Obteniendo reservas", data: reservations, pagination })
    }),

    cancel: asyncHandler(async (req, res) => {
        const reservation = await reservationService.cancel(req.params.id, req.user)
        res.status(200).json({ ok: true, msg: "Reserva cancelada", data: reservation })
    }),
}