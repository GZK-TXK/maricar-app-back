import express from "express"
import { reservationController } from "../controllers/reservationController.js"
import { authValidation } from "../middlewares/authValidation.js"
import { adminValidation } from "../middlewares/adminValidation.js"

export const reservationRoutes = express.Router()

// Crear reserva (usuario logueado) → devuelve checkoutUrl
reservationRoutes.post("/", authValidation, reservationController.create)

// Mis reservas (usuario logueado)
reservationRoutes.get("/my", authValidation, reservationController.getMyReservations)

// Reserva por session_id de Stripe (página de confirmación)
reservationRoutes.get("/session/:sessionId", authValidation, reservationController.getBySession)

// Todas las reservas (admin)
reservationRoutes.get("/", authValidation, adminValidation, reservationController.getAll)

// Cancelar reserva (admin)
reservationRoutes.patch("/:id/cancel", authValidation, adminValidation, reservationController.cancel)