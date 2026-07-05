import Cars from '../models/Car.js'
import { cloudinary } from '../config/cloudinary.js'

const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return
    const segments = imageUrl.split('/')
    const publicId = segments.slice(-2).join('/').split('.')[0]
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.log('Error al eliminar imagen de Cloudinary:', error.message)
    }
}

const carsCotrollers = {

    create: async (req, res) => {
        try {
            const car = req.body
            const coche = await Cars.findOne({ plate: car.plate })
            if (coche) {
                return res.status(403).json({
                    ok: false,
                    msg: 'Ya hay un coche con esa matricula'
                })
            }
            if (req.file) car.imageUrl = req.file.path
            const newCar = await new Cars(car)
            const carSaved = await newCar.save()
            res.status(200).json({
                ok: true,
                msg: 'Creando cars.',
                data: carSaved
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                ok: false,
                msg: 'Error ask Maricarmen'
            })
        }
    },

    getAllCars: async (req, res) => {
        try {
            const getCars = await Cars.find({})
            res.status(200).json({
                ok: true,
                msg: 'Obteniendo cars.',
                data: getCars
            })
        } catch (error) {
            res.status(500).json({
                ok: false,
                msg: 'Error ask Maricarmen'
            })
        }
    },

    getCar: async (req, res) => {
        try {
            const getCar = await Cars.findById(req.params.id);
            res.status(200).json({
                ok: true,
                msg: 'Obteniendo coche',
                data: getCar
            })
        } catch (error) {
            res.status(500).json({
                ok: false,
                msg: 'Error ask Maricarmen'
            })
        }
    },

    updateCar: async (req, res) => {
        try {
            if (req.file) {
                const oldCar = await Cars.findById(req.params.id)
                if (oldCar?.imageUrl) await deleteFromCloudinary(oldCar.imageUrl)
                req.body.imageUrl = req.file.path
            }
            if (req.body.unavailableDates && typeof req.body.unavailableDates === 'string') {
                req.body.unavailableDates = JSON.parse(req.body.unavailableDates)
            }
            const updateCar = await Cars.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            res.status(200).json({
                ok: true,
                msg: 'Actualizando coche',
                data: updateCar
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                ok: false,
                msg: 'Error ask Maricarmen'
            })
        }
    },

    deleteCar: async (req, res) => {
        try {
            const car = await Cars.findById(req.params.id)
            if (car?.imageUrl) await deleteFromCloudinary(car.imageUrl)
            await Cars.findByIdAndDelete(req.params.id)
            res.status(200).json({
                ok: true,
                msg: 'Borrando coche'
            })
        } catch (error) {
            res.status(500).json({
                ok: false,
                msg: 'Error ask Maricarmen'
            })
        }
    }
}

export default carsCotrollers
