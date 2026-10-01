import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'

const app = createApp()

const validUser = {
    name: 'Ana',
    surname: 'García',
    email: 'ana@test.com',
    password: 'Password1',
    birthday: '1990-01-01',
    phone: '600111222',
    direction: 'Calle 1',
}

describe('Auth', () => {
    it('registra un usuario y setea cookie', async () => {
        const res = await request(app).post('/api/v1/auth/register').send(validUser)
        expect(res.status).toBe(201)
        expect(res.body.ok).toBe(true)
        expect(res.body.data.user.email).toBe('ana@test.com')
        expect(res.headers['set-cookie']).toBeDefined()
    })

    it('rechaza email duplicado', async () => {
        await request(app).post('/api/v1/auth/register').send(validUser)
        const res = await request(app).post('/api/v1/auth/register').send(validUser)
        expect(res.status).toBe(409)
    })

    it('rechaza login con contraseña incorrecta', async () => {
        await request(app).post('/api/v1/auth/register').send(validUser)
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: validUser.email, password: 'Wrong123' })
        expect(res.status).toBe(401)
    })

    it('login correcto', async () => {
        await request(app).post('/api/v1/auth/register').send(validUser)
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: validUser.email, password: validUser.password })
        expect(res.status).toBe(200)
        expect(res.body.data.user.email).toBe(validUser.email)
    })

    it('valida datos incorrectos en registro', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ name: '', email: 'no', password: '123' })
        expect(res.status).toBe(400)
    })
})