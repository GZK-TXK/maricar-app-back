import jwt from "jsonwebtoken"

const getToken = (req) => {
    if (req.cookies?.token) return req.cookies.token
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith("Bearer ")) return authHeader.split(" ")[1]
    return null
}

export const authValidation = (req, res, next) => {
    const token = getToken(req)
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: "Token no valido",
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: "Token no valido o ya ha expirado."
        })
    }
}