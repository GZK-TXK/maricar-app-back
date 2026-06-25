import express from "express"
import { validateUser } from '../middlewares/validations.js';
import { validateImputs } from '../middlewares/validateInputs.js';
import { userController } from '../controllers/userController.js';

export const userRoutes = express.Router();

//POST /users/api/v1/
userRoutes.post('/',[
    validateUser,
    validateImputs
],
userController.create
);

//GET /users/api/v1/users
userRoutes.get('/',userController.getAllUsers)

//GET /users/api/v1/users/:id
userRoutes.get('/:id', userController.getUser)

//PUT /users/api/v1/users/:id
userRoutes.put('/:id',userController.updateUser)

//DELETE /users/v1/users/:id
userRoutes.delete('/:id', userController.deleteUser)
