import express from "express"
import carsCotrollers from "../controllers/carControllers.js";
import { validateImputs } from "../middlewares/validateInputs.js";
import { validateCar } from "../middlewares/validations.js";
import { upload } from "../middlewares/upload.js"
import { authValidation } from "../middlewares/authValidation.js"
import { adminValidation } from "../middlewares/adminValidation.js"

const carRoutes = express.Router();

//POST /cars/api/v1/
carRoutes.post('/', authValidation, adminValidation, upload.single("image"), [ validateCar, validateImputs ], carsCotrollers.create)

//GET /cars/api/v1/cars/
carRoutes.get('/',carsCotrollers.getAllCars)


//GET /cars/api/v1/cars/:id
carRoutes.get('/:id', carsCotrollers.getCar)


//PUT /cars/api/v1/cars/:id
carRoutes.put('/:id', authValidation, adminValidation, upload.single("image"), carsCotrollers.updateCar)


//DELETE /cars/api/v1/cars/:id
carRoutes.delete('/:id', authValidation, adminValidation, carsCotrollers.deleteCar)


export default carRoutes