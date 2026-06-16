


const carsCotrollers = {



    create: (req, res) => {

        //recoger los datos del formulario

        const cosita = req.body
        console.log(cosita)

        //validar los datos
        


        // comprobar si existe el coche retornar 400



        res.status(200).json({
            ok: true,
            msg: 'Creando cars.'
        })
    },

    getAllCars: (req, res) => {
        res.status(200).json({
            ok: true,
            msg: 'Obteniendo cars.'
        })
    },


    getCar: (req, res) => {
        res.status(200).json({
            ok: true,
            msg: 'Obteniendo coche por su id'
        })
    },


    updateCar: (req, res) => {
        res.status(200).json({
            ok: true,
            msg: 'Actualizando coche'
        })
    },

    deleteCar: (req, res) => {
        res.status(200).json({
            ok: true,
            msg: 'Borrando coche'
        })
    }
}


export default carsCotrollers