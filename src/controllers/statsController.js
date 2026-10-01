import { statsService } from "../services/statsService.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const statsController = {
    getStats: asyncHandler(async (req, res) => {
        const data = await statsService.getStats()
        res.status(200).json({ ok: true, msg: "Estadísticas", data })
    }),
}