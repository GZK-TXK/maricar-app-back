import express from "express"
import { contactController } from "../controllers/contactController.js"

export const contactRoutes = express.Router()

contactRoutes.post("/", contactController.send)