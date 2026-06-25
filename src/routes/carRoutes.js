import express from "express"
import carsCotrollers from "../controllers/carControllers.js";
import { validateImputs } from "../middlewares/validateInputs.js";
import { validateCar } from "../middlewares/validations.js";

const carRoutes = express.Router();

//POST /cars/api/v1/
carRoutes.post('/',[
   validateCar,
   validateImputs
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