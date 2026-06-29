import {check} from 'express-validator'

export const validateCar=[
    check("brand", "Brand is required").not().isEmpty(),
    check("brand", "Brand must be text").isString(),
    check("plate", "Plate is required").not().isEmpty(),
    check("plate", "Plate must be text").isString(),
    check("model", "Model is required").not().isEmpty(),
    check("model", "Model must be text").isString(),
    check("category", "Category is required").not().isEmpty(),
    check("category", "Category must be text").isString(),
    check("pricePerDay", "Price per day is required").not().isEmpty(),
    check("pricePerDay", "Price per day must be a number").isNumeric(),
    check("pricePerDay", "The price must be higher than 0").custom((value) => value > 0),
]

export const validateUser=[
    check("name", "Name is required").not().isEmpty(),
    check("name", "Name must be text").isString(),
    check("surname", "Surname must be text").isString(),
    check("email", "Email is required").not().isEmpty(),
    check("email", "Email must be text").isString(),
    check("password", "Password is required").not().isEmpty(),
    check("password", "Password must be text").isString(),
    check("birthday", "Birthday is required").not().isEmpty(),
    check("birthday", "Birthday must be a date").isDate(),
    check("direction", "Direction must be text").isString(),
    check("phone", "Phone is required").not().isEmpty(),
    check("phone", "Phone must be text").isNumeric(),
]

export const validateContact = [
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("email", "Email invalido").isEmail(),
    check("phone", "El telefono es obligatorio").not().isEmpty(),
    check("carInfo", "La informacion del coche es obligatoria").not().isEmpty(),
]