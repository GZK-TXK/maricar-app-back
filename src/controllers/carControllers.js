import Cars from '../models/Car.js'

const carsCotrollers = {



    create: async (req, res) => {
        try {
            console.log('Creando......')
            //recoger los datos del formulario

            const car = req.body

            // comprobar si existe el coche retornar 400
            const coche = await Cars.findOne({ plate: car.plate })
            console.log(coche)

            if (coche) {
                return res.status(403).json({
                    ok: false,
                    msg: 'Ya hay un coche con esa matricula'
                })
            }

            if (req.file) car.imageUrl = "/uploads/" + req.file.filename

            const newCar = await new Cars(car)
            console.log(newCar)
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
            console.log(getCars)
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
            const getCar = await Cars.findById(req.params.id, 'brand model pricePerDay available');
            console.log(getCar)
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
            const updateCar = await Cars.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            console.log(updateCar)
            res.status(200).json({
                ok: true,
                msg: 'Actualizando coche',
                data: updateCar
            })

        } catch (error) {
            res.status(500).json({
                ok: false,
                msg: 'Error ask Maricarmen'
            })
        }
    },
    deleteCar: async (req, res) => {
        try {
            const deleteCar = await Cars.findByIdAndDelete(req.params.id)
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