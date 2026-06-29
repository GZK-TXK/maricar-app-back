import express from "express"
import { contactController } from "../controllers/contactController.js"
import { validateContact } from "../middlewares/validations.js"
import { validateImputs } from "../middlewares/validateInputs.js"

export const contactRoutes = express.Router()

contactRoutes.post("/", validateContact, validateImputs, contactController.send)