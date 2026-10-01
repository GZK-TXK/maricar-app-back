import { env } from "../config/env.js"

export const errorHandler = (err, req, res, next) => {
    if (err?.message === "Origen no permitido por CORS") {
        return res.status(403).json({ ok: false, msg: err.message })
    }
    if (err?.name === "MulterError") {
        return res.status(400).json({ ok: false, msg: `Error de subida: ${err.message}` })
    }
    if (typeof err?.message === "string" && err.message.startsWith("Solo imágenes")) {
        return res.status(400).json({ ok: false, msg: err.message })
    }
    if (err?.name === "ValidationError") {
        const errors = Object.values(err.errors || {}).map((e) => e.message)
        return res.status(400).json({ ok: false, msg: "Datos inválidos", errors })
    }
    if (err?.name === "CastError") {
        return res.status(400).json({ ok: false, msg: "Identificador inválido" })
    }
    if (err?.code === 11000) {
        return res.status(409).json({ ok: false, msg: "Ya existe un registro con ese valor" })
    }
    if (err?.isOperational) {
        return res.status(err.statusCode || 500).json({ ok: false, msg: err.message })
    }

    console.error(err)
    res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
        ...(env.isProd ? {} : { error: err?.message }),
    })
}