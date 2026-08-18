import express from "express"
import { validateUser } from '../middlewares/validations.js';
import { validateImputs } from '../middlewares/validateInputs.js';
import { userController } from '../controllers/userController.js';
import { authValidation } from "../middlewares/authValidation.js"
import { adminValidation } from "../middlewares/adminValidation.js"

export const userRoutes = express.Router();

//POST /users/api/v1/
userRoutes.post('/',[
    validateUser,
    validateImputs
],
userController.create
);

//GET /users/api/v1/users
userRoutes.get('/', authValidation, adminValidation, userController.getAllUsers)
//GET /users/api/v1/users/:id
userRoutes.get('/:id', authValidation, adminValidation, userController.getUser)

//PUT /users/api/v1/users/:id
userRoutes.put('/:id', authValidation, adminValidation, userController.updateUser)

//DELETE /users/v1/users/:id
userRoutes.delete('/:id', authValidation, adminValidation, userController.deleteUser)