import { userService } from "../services/userService.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const userController = {
    create: asyncHandler(async (req, res) => {
        const user = await userService.create(req.body)
        res.status(201).json({ ok: true, msg: "Usuario creado", data: user })
    }),

    getAllUsers: asyncHandler(async (req, res) => {
        const { users, pagination } = await userService.getAll(req.query)
        res.status(200).json({ ok: true, msg: "Obteniendo usuarios", data: users, pagination })
    }),

    getUser: asyncHandler(async (req, res) => {
        const user = await userService.getById(req.params.id)
        res.status(200).json({ ok: true, msg: "Obteniendo usuario", data: user })
    }),

    updateUser: asyncHandler(async (req, res) => {
        const user = await userService.update(req.params.id, req.body)
        res.status(200).json({ ok: true, msg: "Usuario actualizado", data: user })
    }),

    deleteUser: asyncHandler(async (req, res) => {
        await userService.remove(req.params.id)
        res.status(200).json({ ok: true, msg: "Usuario eliminado" })
    }),
}