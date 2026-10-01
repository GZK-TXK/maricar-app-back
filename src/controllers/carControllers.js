import { carService } from "../services/carService.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const carsCotrollers = {
    create: asyncHandler(async (req, res) => {
        const car = await carService.create(req.body, req.files || [])
        res.status(201).json({ ok: true, msg: "Coche creado", data: car })
    }),

    getAllCars: asyncHandler(async (req, res) => {
        const { cars, pagination } = await carService.getAll(req.query)
        res.status(200).json({ ok: true, msg: "Obteniendo cars.", data: cars, pagination })
    }),

    getCar: asyncHandler(async (req, res) => {
        const car = await carService.getById(req.params.id)
        res.status(200).json({ ok: true, msg: "Obteniendo coche", data: car })
    }),

    updateCar: asyncHandler(async (req, res) => {
        const car = await carService.update(req.params.id, req.body, req.files || [])
        res.status(200).json({ ok: true, msg: "Coche actualizado", data: car })
    }),

    deleteCar: asyncHandler(async (req, res) => {
        await carService.remove(req.params.id)
        res.status(200).json({ ok: true, msg: "Coche eliminado" })
    }),
}

export default carsCotrollers