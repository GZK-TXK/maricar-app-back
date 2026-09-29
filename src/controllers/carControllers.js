import Cars from '../models/Car.js'
import mongoose from 'mongoose'
import { cloudinary } from '../config/cloudinary.js'

const ALLOWED_FIELDS = ['brand', 'model', 'plate', 'category', 'pricePerDay', 'imageUrl', 'available', 'unavailableDates']

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const pickCarFields = (body = {}) => {
    const data = {}
    for (const key of ALLOWED_FIELDS) {
        if (body[key] !== undefined) data[key] = body[key]
    }
    if (data.available !== undefined) {
        data.available = data.available === true || data.available === 'true'
    }
    if (typeof data.unavailableDates === 'string') {
        try {
            data.unavailableDates = JSON.parse(data.unavailableDates)
        } catch {
            delete data.unavailableDates
        }
    }
    return data
}

const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return
    const afterUpload = imageUrl.split('?')[0].split('/upload/')[1]
    if (!afterUpload) return
    const publicId = afterUpload.replace(/^v\d+\//, '').replace(/\.[a-z0-9]+$/i, '')
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', error.message)
    }
}

const carsCotrollers = {

    create: async (req, res) => {
        try {
            const car = pickCarFields(req.body)
            const coche = await Cars.findOne({ plate: car.plate })
            if (coche) {
                return res.status(409).json({ ok: false, msg: 'Ya hay un coche con esa matrícula' })
            }
            if (req.file) car.imageUrl = req.file.path
            const newCar = await new Cars(car)
            const carSaved = await newCar.save()
            res.status(201).json({ ok: true, msg: 'Coche creado', data: carSaved })
        } catch (error) {
            console.error(error)
            res.status(500).json({ ok: false, msg: 'Error al crear el coche' })
        }
    },

    getAllCars: async (req, res) => {
        try {
            const getCars = await Cars.find({})
            res.status(200).json({ ok: true, msg: 'Obteniendo cars.', data: getCars })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al obtener los coches' })
        }
    },

    getCar: async (req, res) => {
        try {
            if (!isValidId(req.params.id)) {
                return res.status(400).json({ ok: false, msg: 'Id inválido' })
            }
            const getCar = await Cars.findById(req.params.id)
            if (!getCar) {
                return res.status(404).json({ ok: false, msg: 'Coche no encontrado' })
            }
            res.status(200).json({ ok: true, msg: 'Obteniendo coche', data: getCar })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al obtener el coche' })
        }
    },

    updateCar: async (req, res) => {
        try {
            if (!isValidId(req.params.id)) {
                return res.status(400).json({ ok: false, msg: 'Id inválido' })
            }
            const data = pickCarFields(req.body)
            if (req.file) {
                const oldCar = await Cars.findById(req.params.id)
                if (oldCar?.imageUrl) await deleteFromCloudinary(oldCar.imageUrl)
                data.imageUrl = req.file.path
            }
            const updateCar = await Cars.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
            if (!updateCar) {
                return res.status(404).json({ ok: false, msg: 'Coche no encontrado' })
            }
            res.status(200).json({ ok: true, msg: 'Coche actualizado', data: updateCar })
        } catch (error) {
            console.error(error)
            res.status(500).json({ ok: false, msg: 'Error al actualizar el coche' })
        }
    },

    deleteCar: async (req, res) => {
        try {
            if (!isValidId(req.params.id)) {
                return res.status(400).json({ ok: false, msg: 'Id inválido' })
            }
            const car = await Cars.findById(req.params.id)
            if (!car) {
                return res.status(404).json({ ok: false, msg: 'Coche no encontrado' })
            }
            if (car.imageUrl) await deleteFromCloudinary(car.imageUrl)
            await Cars.findByIdAndDelete(req.params.id)
            res.status(200).json({ ok: true, msg: 'Coche eliminado' })
        } catch (error) {
            res.status(500).json({ ok: false, msg: 'Error al eliminar el coche' })
        }
    }
}

export default carsCotrollers