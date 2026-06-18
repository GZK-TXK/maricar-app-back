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

export const user=[]