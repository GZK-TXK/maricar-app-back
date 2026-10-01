import express from "express"
import { statsController } from "../controllers/statsController.js"
import { authValidation } from "../middlewares/authValidation.js"
import { adminValidation } from "../middlewares/adminValidation.js"

export const adminRoutes = express.Router()

adminRoutes.get("/stats", authValidation, adminValidation, statsController.getStats)