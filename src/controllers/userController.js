import Users from '../models/User.js'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const ALLOWED_FIELDS = ['name', 'surname', 'email', 'password', 'role', 'birthday', 'direction', 'phone']

const pickUserFields = (body = {}) => {
    const data = {}
    for (const key of ALLOWED_FIELDS) {
        if (body[key] !== undefined) data[key] = body[key]
    }
    return data
}

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

export const userController = {
    create: async (req, res) => {
        try {
            const data = pickUserFields(req.body)
            const usuario = await Users.findOne({ email: data.email })
            if (usuario) {
                return res.status(409).json({ ok: false, msg: 'Email ya registrado' })
            }
            const newUser = await new Users(data)
            await newUser.save()
            const userSaved = await Users.findById(newUser._id).select('-password')

            res.status(201).json({ ok: true, msg: 'Usuario creado', data: userSaved })
        } catch (error) {
            console.error(error)
            res.status(500).json({ ok: false, msg: 'Error al crear el usuario' })
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const getUsers = await Users.find({}, 'name surname email role birthday direction phone')
            res.status(200).json({ ok: true, msg: 'Obteniendo usuarios', data: getUsers })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al obtener los usuarios' })
        }
    },

    getUser: async (req, res) => {
        try {
            if (!isValidId(req.params.id)) {
                return res.status(400).json({ ok: false, msg: 'Id inválido' })
            }
            const getUser = await Users.findById(req.params.id, 'name surname email role birthday direction phone')
            if (!getUser) {
                return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' })
            }
            res.status(200).json({ ok: true, msg: 'Obteniendo usuario', data: getUser })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al obtener el usuario' })
        }
    },

    updateUser: async (req, res) => {
        try {
            if (!isValidId(req.params.id)) {
                return res.status(400).json({ ok: false, msg: 'Id inválido' })
            }
            const data = pickUserFields(req.body)

            if (!data.password) {
                delete data.password
            } else {
                const salt = await bcrypt.genSalt(10)
                data.password = await bcrypt.hash(data.password, salt)
            }

            if (data.email) {
                const exists = await Users.findOne({ email: data.email, _id: { $ne: req.params.id } })
                if (exists) {
                    return res.status(409).json({ ok: false, msg: 'Email ya registrado' })
                }
            }

            const updateUser = await Users.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).select('-password')
            if (!updateUser) {
                return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' })
            }
            res.status(200).json({ ok: true, msg: 'Usuario actualizado', data: updateUser })
        } catch (error) {
            console.error(error)
            res.status(500).json({ ok: false, msg: 'Error al actualizar el usuario' })
        }
    },

    deleteUser: async (req, res) => {
        try {
            if (!isValidId(req.params.id)) {
                return res.status(400).json({ ok: false, msg: 'Id inválido' })
            }
            const deleteUser = await Users.findByIdAndDelete(req.params.id)
            if (!deleteUser) {
                return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' })
            }
            res.status(200).json({ ok: true, msg: "Usuario eliminado" })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al eliminar el usuario' })
        }
    }
}