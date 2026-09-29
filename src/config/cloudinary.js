import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const UPLOAD_OPTIONS = {
  folder: 'maricar-app',
  resource_type: 'image',
  allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  transformation: [{ width: 800, height: 600, crop: 'limit' }],
}

class CloudinaryStorage {
  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(UPLOAD_OPTIONS, (error, result) => {
      if (error) return cb(error)
      cb(null, {
        path: result.secure_url,
        filename: result.public_id,
        size: result.bytes,
      })
    })
    file.stream.pipe(uploadStream)
  }

  _removeFile(req, file, cb) {
    if (!file?.filename) return cb(null)
    cloudinary.uploader.destroy(file.filename, (error) => cb(error))
  }
}

const storage = new CloudinaryStorage()

export { cloudinary, storage }