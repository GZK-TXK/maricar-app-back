import { check } from 'express-validator'

export const validateCar = [
    check("brand", "La marca es obligatoria").trim().notEmpty().isString().isLength({ max: 60 }),
    check("plate", "La matrícula es obligatoria").trim().notEmpty().isString().isLength({ max: 20 }),
    check("model", "El modelo es obligatorio").trim().notEmpty().isString().isLength({ max: 60 }),
    check("category", "La categoría es obligatoria").trim().notEmpty().isString().isLength({ max: 40 }),
    check("pricePerDay", "El precio es obligatorio").notEmpty().isNumeric().withMessage("El precio debe ser un número")
        .custom((value) => Number(value) > 0).withMessage("El precio debe ser mayor que 0"),
    check("available").optional().isBoolean().withMessage("available debe ser booleano"),
]

const passwordRule = check("password", "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)

const phoneRule = check("phone", "El teléfono es obligatorio")
    .trim().notEmpty()
    .matches(/^[0-9+\s-]{6,20}$/).withMessage("Teléfono inválido")

export const validateRegister = [
    check("name", "El nombre es obligatorio").trim().notEmpty().isString().isLength({ max: 80 }),
    check("surname").optional({ checkFalsy: true }).trim().isString().isLength({ max: 80 }),
    check("email", "Email inválido").trim().isEmail().normalizeEmail(),
    passwordRule,
    check("birthday", "Fecha de nacimiento inválida").isISO8601().toDate(),
    phoneRule,
    check("direction").optional({ checkFalsy: true }).trim().isString().isLength({ max: 200 }),
]

export const validateLogin = [
    check("email", "Email inválido").trim().isEmail().normalizeEmail(),
    check("password", "La contraseña es obligatoria").notEmpty().isString(),
]

export const validateForgotPassword = [
    check("email", "Email inválido").trim().isEmail().normalizeEmail(),
]

export const validateResetPassword = [
    check("token", "Token requerido").notEmpty().isString(),
    passwordRule,
]

export const validateUserCreate = [
    check("name", "El nombre es obligatorio").trim().notEmpty().isString().isLength({ max: 80 }),
    check("surname").optional({ checkFalsy: true }).trim().isString().isLength({ max: 80 }),
    check("email", "Email inválido").trim().isEmail().normalizeEmail(),
    passwordRule,
    check("birthday", "Fecha de nacimiento inválida").isISO8601().toDate(),
    phoneRule,
    check("direction").optional({ checkFalsy: true }).trim().isString().isLength({ max: 200 }),
    check("role").optional().isIn(["user", "admin"]).withMessage("Rol inválido"),
]

export const validateUserUpdate = [
    check("name").optional().trim().isString().isLength({ max: 80 }),
    check("surname").optional({ checkFalsy: true }).trim().isString().isLength({ max: 80 }),
    check("email").optional().trim().isEmail().normalizeEmail(),
    check("password").optional({ checkFalsy: true }).isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
        .withMessage("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número"),
    check("birthday").optional().isISO8601().toDate(),
    check("phone").optional().trim().matches(/^[0-9+\s-]{6,20}$/).withMessage("Teléfono inválido"),
    check("direction").optional({ checkFalsy: true }).trim().isString().isLength({ max: 200 }),
    check("role").optional().isIn(["user", "admin"]).withMessage("Rol inválido"),
]

export const validateContact = [
    check("name", "El nombre es obligatorio").trim().notEmpty().isLength({ max: 80 }),
    check("email", "Email inválido").trim().isEmail().normalizeEmail(),
    check("phone", "El teléfono es obligatorio").trim().notEmpty().isLength({ max: 20 }),
    check("carInfo", "La información del coche es obligatoria").trim().notEmpty().isLength({ max: 120 }),
    check("message").optional({ checkFalsy: true }).trim().isString().isLength({ max: 2000 }),
]

export const validateReservation = [
    check("carId", "carId inválido").isMongoId(),
    check("startDate", "Fecha de inicio inválida").isISO8601().toDate(),
    check("endDate", "Fecha de fin inválida").isISO8601().toDate(),
]