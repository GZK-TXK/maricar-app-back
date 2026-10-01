import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import Users from "../models/User.js"
import { AppError } from "../utils/AppError.js"
import { getPagination, buildPagination, noPagination } from "../utils/pagination.js"

const ALLOWED_FIELDS = ["name", "surname", "email", "password", "role", "birthday", "direction", "phone"]

const pickUserFields = (body = {}) => {
    const data = {}
    for (const key of ALLOWED_FIELDS) {
        if (body[key] !== undefined) data[key] = body[key]
    }
    return data
}

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

export const userService = {
    create: async (body) => {
        const data = pickUserFields(body)
        const exists = await Users.findOne({ email: data.email })
        if (exists) throw new AppError("Email ya registrado", 409)

        const newUser = new Users(data)
        await newUser.save()
        return Users.findById(newUser._id).select("-password")
    },

    getAll: async (query) => {
        const { paginate, page, limit } = getPagination(query)

        let q = Users.find({}, "name surname email role birthday direction phone").sort({ _id: -1 })

        if (paginate) {
            const total = await Users.countDocuments({})
            q = q.skip((page - 1) * limit).limit(limit)
            const users = await q
            return { users, pagination: buildPagination(page, limit, total) }
        }

        const users = await q
        return { users, pagination: noPagination(users.length) }
    },

    getById: async (id) => {
        if (!isValidId(id)) throw new AppError("Id inválido", 400)
        const user = await Users.findById(id, "name surname email role birthday direction phone")
        if (!user) throw new AppError("Usuario no encontrado", 404)
        return user
    },

    update: async (id, body) => {
        if (!isValidId(id)) throw new AppError("Id inválido", 400)

        const data = pickUserFields(body)

        if (!data.password) {
            delete data.password
        } else {
            const salt = await bcrypt.genSalt(10)
            data.password = await bcrypt.hash(data.password, salt)
        }

        if (data.email) {
            const exists = await Users.findOne({ email: data.email, _id: { $ne: id } })
            if (exists) throw new AppError("Email ya registrado", 409)
        }

        const user = await Users.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select("-password")
        if (!user) throw new AppError("Usuario no encontrado", 404)
        return user
    },

    remove: async (id) => {
        if (!isValidId(id)) throw new AppError("Id inválido", 400)
        const user = await Users.findByIdAndDelete(id)
        if (!user) throw new AppError("Usuario no encontrado", 404)
    },
}   