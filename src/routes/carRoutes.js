import express from "express"
import {check} from 'express-validator'
import carsCotrollers from "../controllers/carControllers.js";
import { validateImputs } from "../middlewares/validateInputs.js";

const carRoutes = express.Router();

//POST /cars/api/v1/
carRoutes.post('/',[
    check("brand", "Brand is required").not().isEmpty(),
    check("brand", "Brand must be text").isString(),
    check("model", "Model is required").not().isEmpty(),
    check("model", "Model must be text").isString(),
    check("category", "Category is required").not().isEmpty(),
    check("category", "Category must be text").isString(),
    check("pricePerDay", "Price per day is required").not().isEmpty(),
    check("pricePerDay", "Price per day must be a number").isNumeric(),
    check("pricePerDay", "The price must be higher than 0").custom((value) => value > 0),
    validateImputs,
  ],
  carsCotrollers.create
);

//GET /cars/api/v1/cars/
carRoutes.get('/',carsCotrollers.getAllCars)


//GET /cars/api/v1/cars/:id
carRoutes.get('/:id', carsCotrollers.getCar)


//PUT /cars/api/v1/cars/:id
carRoutes.put('/:id', carsCotrollers.updateCar)


//DELETE /cars/api/v1/cars/:id
carRoutes.delete('/:id', carsCotrollers.deleteCar)





export default carRoutes