import mongoose from "mongoose"
import Cars from "../models/Car.js"
import Reservation from "../models/Reservation.js"
import { cloudinary } from "../config/cloudinary.js"
import { AppError } from "../utils/AppError.js"
import { getPagination, buildPagination, noPagination } from "../utils/pagination.js"

const ALLOWED_FIELDS = ["brand", "model", "plate", "category", "pricePerDay", "imageUrl", "available", "unavailableDates"]

const pickCarFields = (body = {}) => {
    const data = {}
    for (const key of ALLOWED_FIELDS) {
        if (body[key] !== undefined) data[key] = body[key]
    }
    if (data.available !== undefined) {
        data.available = data.available === true || data.available === "true"
    }
    if (typeof data.unavailableDates === "string") {
        try {
            data.unavailableDates = JSON.parse(data.unavailableDates)
        } catch {
            delete data.unavailableDates
        }
    }
    return data
}

const getCarImages = (car) => {
    if (car.images?.length) return car.images
    return car.imageUrl ? [car.imageUrl] : []
}

const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes("cloudinary")) return
    const afterUpload = imageUrl.split("?")[0].split("/upload/")[1]
    if (!afterUpload) return
    const publicId = afterUpload.replace(/^v\d+\//, "").replace(/\.[a-z0-9]+$/i, "")
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.error("Error al eliminar imagen de Cloudinary:", error.message)
    }
}

const buildFilter = async (query = {}) => {
    const { category, minPrice, maxPrice, search, startDate, endDate } = query
    const filter = {}

    if (category) filter.category = category

    const min = Number(minPrice)
    const max = Number(maxPrice)
    if (minPrice !== undefined && minPrice !== "" && !Number.isNaN(min)) {
        filter.pricePerDay = { ...(filter.pricePerDay || {}), $gte: min }
    }
    if (maxPrice !== undefined && maxPrice !== "" && !Number.isNaN(max)) {
        filter.pricePerDay = { ...(filter.pricePerDay || {}), $lte: max }
    }

    if (search) {
        const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        filter.$or = [
            { brand: { $regex: safe, $options: "i" } },
            { model: { $regex: safe, $options: "i" } },
        ]
    }

    if (startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
            throw new AppError("Rango de fechas inválido", 400)
        }
        filter.unavailableDates = {
            $not: { $elemMatch: { start: { $lte: end }, end: { $gte: start } } }
        }
        const conflicting = await Reservation.find({
            status: { $in: ["pending", "paid"] },
            startDate: { $lte: end },
            endDate: { $gte: start },
        }).distinct("car")
        if (conflicting.length) {
            filter._id = { $nin: conflicting }
        }
    }

    return filter
}

export const carService = {
    create: async (body, files = []) => {
        const data = pickCarFields(body)
        const exists = await Cars.findOne({ plate: data.plate })
        if (exists) throw new AppError("Ya hay un coche con esa matrícula", 409)

        const images = files.map((f) => f.path)
        data.images = images
        data.imageUrl = images[0] || ""

        return Cars.create(data)
    },

    getAll: async (query) => {
        const filter = await buildFilter(query)
        const { paginate, page, limit } = getPagination(query)

        let q = Cars.find(filter).sort({ createdAt: -1 })

        if (paginate) {
            const total = await Cars.countDocuments(filter)
            q = q.skip((page - 1) * limit).limit(limit)
            const cars = await q
            return { cars, pagination: buildPagination(page, limit, total) }
        }

        const cars = await q
        return { cars, pagination: noPagination(cars.length) }
    },

    getById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Id inválido", 400)
        const car = await Cars.findById(id)
        if (!car) throw new AppError("Coche no encontrado", 404)
        return car
    },

    update: async (id, body, files = []) => {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Id inválido", 400)

        const data = pickCarFields(body)
        const hasKeepImages = body.keepImages !== undefined

        if (files.length > 0 || hasKeepImages) {
            const oldCar = await Cars.findById(id)
            if (!oldCar) throw new AppError("Coche no encontrado", 404)

            let keepImages = []
            if (hasKeepImages) {
                try {
                    keepImages = JSON.parse(body.keepImages)
                } catch {
                    keepImages = []
                }
            }

            const oldImages = getCarImages(oldCar)
            const newUrls = files.map((f) => f.path)
            const finalImages = [...keepImages, ...newUrls]

            for (const url of oldImages) {
                if (!keepImages.includes(url)) await deleteFromCloudinary(url)
            }

            data.images = finalImages
            data.imageUrl = finalImages[0] || ""
        }

        const car = await Cars.findByIdAndUpdate(id, data, { new: true, runValidators: true })
        if (!car) throw new AppError("Coche no encontrado", 404)
        return car
    },

    remove: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Id inválido", 400)
        const car = await Cars.findById(id)
        if (!car) throw new AppError("Coche no encontrado", 404)

        for (const url of getCarImages(car)) {
            await deleteFromCloudinary(url)
        }

        await Cars.findByIdAndDelete(id)
    },
}