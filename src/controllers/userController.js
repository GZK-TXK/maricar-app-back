import Users from '../models/User.js'
import bcrypt from "bcryptjs"

export const userController = {
    create: async (req, res) => {
        try {
            const user = req.body
            const usuario = await Users.findOne({ email: user.email })
            if (usuario) {
                return res.status(403).json({
                    ok: false,
                    msg: 'Email ya registrado'
                })
            }
            const newUser = await new Users(user)
            await newUser.save()
            const userSaved = await Users.findById(newUser._id).select('-password')

            res.status(200).json({
                ok: true,
                mesg: 'Creando usuario',
                data: userSaved
            })
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                msg: 'Error, ask Maricarmen'
            })
        }

    },
    getAllUsers: async (req, res) => {
        try {
            const getUsers = await Users.find({}, 'name surname email role birthday direction phone')
            res.status(200).json({
                ok: true,
                msg: 'Obteniendo usuarios',
                data: getUsers
            })
        } catch(error){
            res.status(500).json({
                ok:false,
                msg:'Error ask Maricarmen'
            })
        }
    },
    getUser: async (req,res)=>{
        try{
            const getUser = await Users.findById(req.params.id, 'name surname email role birthday direction phone' )
            res.status(200).json({
                ok:true,
                msg: 'Obteniendo usuario',
                data: getUser
            })
        }
        catch (error){
            res.status(500).json({
                ok:false,
                msg: 'Error ask Maricarmen'
            })
        }
    },
    updateUser: async (req,res)=>{
        try{
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
            const updateUser = await Users.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true}).select('-password')
            res.status(200).json({
                ok:true,
                msg:'Cargando usuario',
                data: updateUser
            })
        }catch(error){
            res.status(500).json({
                ok:false,
                msg: 'Error ask Maricarmen'
            })
        }
    },
    deleteUser: async (req,res)=>{
        try{
            const deleteUser= await Users.findByIdAndDelete(req.params.id)
            res.status(200).json({
                ok: true,
                msg:"Borrando usuario"
            })
        }catch(error){
            res.status(500).json({
                ok:false,
                msg: 'Error ask Maricarmen'
            })
        }
    }
}