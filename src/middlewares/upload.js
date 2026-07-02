import multer from "multer"
import path from "path"
import { storage } from "../config/cloudinary.js"

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase())
    const mimeOk = allowed.test(file.mimetype.split("/")[1])
    cb(extOk && mimeOk ? null : new Error("Solo imágenes (jpg, png, gif, webp)"), extOk && mimeOk)
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })
