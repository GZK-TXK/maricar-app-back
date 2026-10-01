import Reservation from "../models/Reservation.js"
import Cars from "../models/Car.js"
import Users from "../models/User.js"

export const statsService = {
    getStats: async () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [byStatus, revenueAgg, totalCars, availableCars, totalUsers, upcoming] = await Promise.all([
            Reservation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            Reservation.aggregate([
                { $match: { status: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } },
            ]),
            Cars.countDocuments({}),
            Cars.countDocuments({ available: true }),
            Users.countDocuments({}),
            Reservation.countDocuments({ status: "paid", startDate: { $gte: today } }),
        ])

        const statusCounts = { pending: 0, paid: 0, cancelled: 0 }
        byStatus.forEach((s) => { statusCounts[s._id] = s.count })

        return {
            reservations: {
                total: statusCounts.pending + statusCounts.paid + statusCounts.cancelled,
                pending: statusCounts.pending,
                paid: statusCounts.paid,
                cancelled: statusCounts.cancelled,
                upcoming,
            },
            revenue: revenueAgg[0]?.total || 0,
            cars: { total: totalCars, available: availableCars },
            users: { total: totalUsers },
        }
    },
}