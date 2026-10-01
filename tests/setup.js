import { beforeAll, afterAll, afterEach } from 'vitest'
import mongoose from 'mongoose'
import { env } from '../src/config/env.js'

const buildTestUri = (uri) => {
    if (!uri) return 'mongodb://127.0.0.1:27017/maricar_test'
    return uri.replace(
        /^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/[^?]*)?(\?.*)?$/,
        '$1/maricar_test$2'
    )
}

const TEST_URI = process.env.MONGODB_URI_TEST || buildTestUri(env.mongoUri)

if (TEST_URI === env.mongoUri) {
    throw new Error('La URI de test no puede ser la misma que la de desarrollo')
}

beforeAll(async () => {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 20000 })
})

afterEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
})

afterAll(async () => {
    await mongoose.disconnect()
})