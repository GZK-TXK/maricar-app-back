import User from "../models/User.js";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    };
};

const signToken = (user) => jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
});

export const authController = {
    register: async (req, res) => {
        try {
            const { name, surname, email, password, direction, birthday, phone } = req.body;

            const existUser = await User.findOne({ email }).lean();
            if (existUser) {
                return res.status(409).json({ ok: false, msg: "Email ya registrado" });
            }

            const user = new User({ name, surname, email, password, direction, birthday, phone });
            await user.save();

            res.cookie(COOKIE_NAME, signToken(user), cookieOptions());

            res.status(201).json({
                ok: true,
                msg: "Usuario registrado correctamente",
                data: { user: publicUser(user) },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, msg: "Error en el registro de usuario" });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email }).select("+password");
            if (!user) {
                return res.status(401).json({ ok: false, msg: "Credenciales inválidas" });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ ok: false, msg: "Credenciales inválidas" });
            }

            res.cookie(COOKIE_NAME, signToken(user), cookieOptions());

            res.json({
                ok: true,
                msg: "Inicio de sesión correcto",
                data: { user: publicUser(user) },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, msg: "Error de inicio de sesión" });
        }
    },

    me: async (req, res) => {
        try {
            const user = await User.findById(req.user.id)
                .select("name surname email role birthday direction phone");
            if (!user) {
                return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
            }
            res.json({
                ok: true,
                data: {
                    id: user._id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    role: user.role,
                    birthday: user.birthday,
                    direction: user.direction,
                    phone: user.phone,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, msg: "Error al obtener el usuario" });
        }
    },

    logout: (req, res) => {
        res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
        res.json({ ok: true, msg: "Sesión cerrada" });
    },
};