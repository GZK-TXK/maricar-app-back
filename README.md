# MariCar App — Backend

API REST del proyecto **MariCar** (alquiler de vehículos). Node.js + Express 5 + MongoDB.

## Stack

- Express 5, Mongoose 9
- Autenticación: jsonwebtoken (cookie httpOnly) + bcryptjs
- Subida de imágenes: multer + Cloudinary
- Emails: nodemailer
- Validación: express-validator
- Seguridad: helmet, express-rate-limit, cors
- Pagos: Stripe
- Tests: Vitest + Supertest

## Requisitos

- Node.js 18+
- MongoDB (local o remoto)
- (Opcional) Cloudinary, Stripe y SMTP para imágenes, pagos y emails

## Instalación

```bash
npm install
cp .env.template .env
```

Rellena `.env` (ver **Variables de entorno**).

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga (nodemon) |
| `npm start` | Servidor en producción |
| `npm test` | Tests (Vitest + Supertest) |
| `npm run test:watch` | Tests en modo watch |

El servidor arranca en `http://localhost:3000` (o el `PORT` configurado).

## Arquitectura

```
src/
├── app.js            Crea y configura la app Express (exporta createApp)
├── server.js         Arranca: valida env, conecta a la BD y escucha
├── config/           env (validación), db, cloudinary, email, stripe
├── routes/           Endpoints + middlewares
├── controllers/      Capa HTTP fina (asyncHandler)
├── services/         Lógica de negocio
├── models/           Esquemas Mongoose (User, Car, Reservation)
├── middlewares/      auth, admin, validación, upload, errorHandler
├── utils/            AppError, asyncHandler, pagination
└── templates/        Plantillas de email
```

Flujo: `routes → controllers → services → models`.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | No | Puerto (por defecto 3000) |
| `NODE_ENV` | No | `development` / `production` |
| `MONGODB_URI` | Sí | Cadena de conexión a MongoDB |
| `JWT_SECRET` | Sí | Secreto para firmar los JWT |
| `JWT_EXPIRES_IN` | No | Caducidad del token (por defecto `7d`) |
| `FRONTEND_URL` | No | Origen(es) permitidos por CORS y base de los enlaces de email |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Sí* | Subida de imágenes |
| `STRIPE_SECRET_KEY` | Sí* | Clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | No | Secreto del webhook de Stripe |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` / `EMAIL_TO` | No | SMTP (si falta, usa Ethereal en desarrollo) |

\* La app no arranca sin `JWT_SECRET`, `MONGODB_URI` y `STRIPE_SECRET_KEY`.

## API REST (`/api/v1`)

Documentación interactiva (Swagger UI) en **`GET /api/docs`** — la spec está en `src/docs/openapi.js`.

- **Auth**: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`.
- **Coches**: `GET /cars` (filtros `category`, `minPrice`, `maxPrice`, `search`, `startDate`, `endDate`, `page`, `limit`), `GET /cars/:id`, `POST /cars` (admin, multipart `images[]`), `PUT /cars/:id` (admin), `DELETE /cars/:id` (admin).
- **Usuarios** (admin): `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`.
- **Reservas**: `POST /reservations`, `GET /reservations/my`, `GET /reservations/:id`, `GET /reservations/session/:sessionId`, `GET /reservations` (admin), `PATCH /reservations/:id/cancel` (dueño o admin).
- **Contacto**: `POST /contact`.
- **Admin**: `GET /admin/stats`.
- **Stripe**: `POST /stripe/webhook`.

Detalle completo en [`../docs/documentacion-tecnica-v2.md`](../docs/documentacion-tecnica-v2.md).

## Tests

```bash
npm test
```

9 tests (auth + coches) con Vitest + Supertest. Usan una base de datos de test `maricar_test` derivada de `MONGODB_URI` (requiere MongoDB accesible).

## Seguridad

Cookie httpOnly, `helmet`, rate limiting, CORS estricto, chequeo de `Origin`, validación y saneo con express-validator, hashing bcrypt, `password` con `select:false` y whitelist de campos. `npm audit` = 0.
