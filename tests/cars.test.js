import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { createApp } from '../src/app.js'
import User from '../src/models/User.js'

const app = createApp()

let adminToken

beforeAll(async () => {
    const admin = await User.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'Password1',
        birthday: new Date('1990-01-01'),
        phone: '600000000',
        role: 'admin',
    })
    adminToken = jwt.sign(
        { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
        process.env.JWT_SECRET
    )
})

describe('Cars', () => {
    it('lista coches (público)', async () => {
        const res = await request(app).get('/api/v1/cars')
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('devuelve 400 con id inválido', async () => {
        const res = await request(app).get('/api/v1/cars/abc')
        expect(res.status).toBe(400)
    })

    it('rechaza crear sin token', async () => {
        const res = await request(app).post('/api/v1/cars').send({ brand: 'X' })
        expect(res.status).toBe(401)
    })

    it('crea un coche como admin', async () => {
        const res = await request(app)
            .post('/api/v1/cars')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('brand', 'Seat')
            .field('model', 'León')
            .field('plate', '1234ABC')
            .field('category', 'turism')
            .field('pricePerDay', '50')
            .field('available', 'true')
        expect(res.status).toBe(201)
        expect(res.body.data.plate).toBe('1234ABC')
    })
})