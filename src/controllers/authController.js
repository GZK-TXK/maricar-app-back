import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const authController = {
    register: async (req, res) => {
        try {
            const { name, surname, email, password, direction, birthday, phone } = req.body;

            const existUser = await User.findOne({ email });
            if (existUser) {
                return res.status(400).json({
                    ok: false,
                    msg: "Email ya registrado",
                });
            }

            const user = new User({ name, surname, email, password, direction, birthday, phone });
            await user.save();

            const token = jwt.sign(
                { id: user._id, name: user.name, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(201).json({
                ok: true,
                msg: "Usuario registrado correctamente",
                data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                msg: "Error en el registro de usuario",
                error: error.message
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    ok: false,
                    msg: "Credenciales inválidas",
                });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    ok: false,
                    msg: "Credenciales inválidas",
                });
            }

            const token = jwt.sign(
                { id: user._id, name: user.name, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.json({
                ok: true,
                msg: "Inicio de sesión correcto",
                data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                msg: "Error de inicio de sesión",
            });
        }
    },
};