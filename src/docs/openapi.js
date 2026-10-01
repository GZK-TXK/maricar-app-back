export const openapiSpec = {
    openapi: "3.0.3",
    info: {
        title: "MariCar API",
        version: "1.0.0",
        description:
            "API REST de MariCar (alquiler de vehículos). Autenticación mediante cookie httpOnly (o cabecera Bearer).",
    },
    servers: [
        { url: "http://localhost:3000/api/v1", description: "Desarrollo" },
    ],
    tags: [
        { name: "Auth", description: "Registro, login y recuperación de contraseña" },
        { name: "Coches", description: "Catálogo y CRUD de vehículos" },
        { name: "Usuarios", description: "Gestión de usuarios (admin)" },
        { name: "Reservas", description: "Reservas y pagos" },
        { name: "Contacto", description: "Formulario de contacto" },
        { name: "Admin", description: "Métricas del panel" },
        { name: "Stripe", description: "Webhook de pagos" },
    ],
    components: {
        securitySchemes: {
            cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
        parameters: {
            IdParam: { name: "id", in: "path", required: true, schema: { type: "string" } },
            SessionIdParam: { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
            PageParam: { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
            LimitParam: { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
        },
        responses: {
            Unauthorized: {
                description: "No autenticado",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            Forbidden: {
                description: "No autorizado",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            NotFound: {
                description: "No encontrado",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            ValidationError: {
                description: "Datos inválidos",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
        },
        schemas: {
            Error: {
                type: "object",
                properties: {
                    ok: { type: "boolean", example: false },
                    msg: { type: "string", example: "Error en la petición" },
                    errors: { type: "object", nullable: true },
                },
            },
            User: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    surname: { type: "string" },
                    email: { type: "string", format: "email" },
                    role: { type: "string", enum: ["user", "admin"] },
                    birthday: { type: "string", format: "date" },
                    direction: { type: "string" },
                    phone: { type: "string" },
                },
            },
            Car: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    brand: { type: "string" },
                    model: { type: "string" },
                    plate: { type: "string" },
                    category: { type: "string" },
                    pricePerDay: { type: "number" },
                    imageUrl: { type: "string" },
                    images: { type: "array", items: { type: "string" } },
                    available: { type: "boolean" },
                    unavailableDates: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                start: { type: "string", format: "date-time" },
                                end: { type: "string", format: "date-time" },
                            },
                        },
                    },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
            },
            Reservation: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    user: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
                    car: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Car" }] },
                    startDate: { type: "string", format: "date-time" },
                    endDate: { type: "string", format: "date-time" },
                    days: { type: "integer" },
                    pricePerDay: { type: "number" },
                    totalPrice: { type: "number" },
                    status: { type: "string", enum: ["pending", "paid", "cancelled"] },
                    stripeSessionId: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                },
            },
            Pagination: {
                type: "object",
                properties: {
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                },
            },
        },
    },
    paths: {
        "/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Registrar un usuario",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "email", "password", "birthday", "phone"],
                                properties: {
                                    name: { type: "string", example: "Ana" },
                                    surname: { type: "string", example: "García" },
                                    email: { type: "string", format: "email", example: "ana@example.com" },
                                    password: { type: "string", example: "Password1" },
                                    birthday: { type: "string", format: "date", example: "1990-01-01" },
                                    phone: { type: "string", example: "600111222" },
                                    direction: { type: "string", example: "Calle 1" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Usuario registrado (set cookie)" },
                    400: { $ref: "#/components/responses/ValidationError" },
                    409: { description: "Email ya registrado" },
                },
            },
        },
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Iniciar sesión",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", format: "email", example: "ana@example.com" },
                                    password: { type: "string", example: "Password1" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Sesión iniciada (set cookie)" },
                    401: { description: "Credenciales inválidas" },
                },
            },
        },
        "/auth/me": {
            get: {
                tags: ["Auth"],
                summary: "Usuario de la sesión",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: { description: "Datos del usuario" },
                    401: { $ref: "#/components/responses/Unauthorized" },
                },
            },
        },
        "/auth/logout": {
            post: {
                tags: ["Auth"],
                summary: "Cerrar sesión",
                responses: { 200: { description: "Sesión cerrada" } },
            },
        },
        "/auth/forgot-password": {
            post: {
                tags: ["Auth"],
                summary: "Solicitar recuperación de contraseña",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email"],
                                properties: { email: { type: "string", format: "email" } },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Respuesta genérica (no revela si el email existe)" } },
            },
        },
        "/auth/reset-password": {
            post: {
                tags: ["Auth"],
                summary: "Restablecer contraseña con token",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["token", "password"],
                                properties: {
                                    token: { type: "string" },
                                    password: { type: "string", example: "Password1" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Contraseña actualizada" },
                    400: { description: "Token inválido o expirado" },
                },
            },
        },
        "/cars": {
            get: {
                tags: ["Coches"],
                summary: "Listar coches (con filtros y paginación)",
                parameters: [
                    { name: "category", in: "query", schema: { type: "string" } },
                    { name: "minPrice", in: "query", schema: { type: "number" } },
                    { name: "maxPrice", in: "query", schema: { type: "number" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
                    { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
                    { $ref: "#/components/parameters/PageParam" },
                    { $ref: "#/components/parameters/LimitParam" },
                ],
                responses: {
                    200: {
                        description: "Listado",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        ok: { type: "boolean" },
                                        data: { type: "array", items: { $ref: "#/components/schemas/Car" } },
                                        pagination: { $ref: "#/components/schemas/Pagination" },
                                    },
                                },
                            },
                        },
                    },
                    400: { $ref: "#/components/responses/ValidationError" },
                },
            },
            post: {
                tags: ["Coches"],
                summary: "Crear coche (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["brand", "model", "plate", "category", "pricePerDay"],
                                properties: {
                                    brand: { type: "string" },
                                    model: { type: "string" },
                                    plate: { type: "string" },
                                    category: { type: "string" },
                                    pricePerDay: { type: "number" },
                                    available: { type: "boolean" },
                                    images: { type: "array", items: { type: "string", format: "binary" } },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Coche creado" },
                    401: { $ref: "#/components/responses/Unauthorized" },
                    403: { $ref: "#/components/responses/Forbidden" },
                    409: { description: "Matrícula duplicada" },
                },
            },
        },
        "/cars/{id}": {
            get: {
                tags: ["Coches"],
                summary: "Detalle de coche",
                parameters: [{ $ref: "#/components/parameters/IdParam" }],
                responses: {
                    200: { description: "Coche", content: { "application/json": { schema: { $ref: "#/components/schemas/Car" } } } },
                    400: { $ref: "#/components/responses/ValidationError" },
                    404: { $ref: "#/components/responses/NotFound" },
                },
            },
            put: {
                tags: ["Coches"],
                summary: "Actualizar coche (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/IdParam" }],
                requestBody: {
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    brand: { type: "string" },
                                    model: { type: "string" },
                                    plate: { type: "string" },
                                    category: { type: "string" },
                                    pricePerDay: { type: "number" },
                                    available: { type: "boolean" },
                                    unavailableDates: { type: "string", description: "JSON de rangos" },
                                    keepImages: { type: "string", description: "JSON de URLs a conservar" },
                                    images: { type: "array", items: { type: "string", format: "binary" } },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Coche actualizado" },
                    401: { $ref: "#/components/responses/Unauthorized" },
                    404: { $ref: "#/components/responses/NotFound" },
                },
            },
            delete: {
                tags: ["Coches"],
                summary: "Eliminar coche (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/IdParam" }],
                responses: {
                    200: { description: "Coche eliminado" },
                    401: { $ref: "#/components/responses/Unauthorized" },
                    404: { $ref: "#/components/responses/NotFound" },
                },
            },
        },
        "/users": {
            get: {
                tags: ["Usuarios"],
                summary: "Listar usuarios (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    { $ref: "#/components/parameters/PageParam" },
                    { $ref: "#/components/parameters/LimitParam" },
                ],
                responses: {
                    200: { description: "Listado de usuarios" },
                    401: { $ref: "#/components/responses/Unauthorized" },
                    403: { $ref: "#/components/responses/Forbidden" },
                },
            },
            post: {
                tags: ["Usuarios"],
                summary: "Crear usuario (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    201: { description: "Usuario creado" },
                    400: { $ref: "#/components/responses/ValidationError" },
                    409: { description: "Email duplicado" },
                },
            },
        },
        "/users/{id}": {
            get: {
                tags: ["Usuarios"],
                summary: "Detalle de usuario (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/IdParam" }],
                responses: {
                    200: { description: "Usuario" },
                    404: { $ref: "#/components/responses/NotFound" },
                },
            },
            put: {
                tags: ["Usuarios"],
                summary: "Actualizar usuario (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/IdParam" }],
                responses: {
                    200: { description: "Usuario actualizado" },
                    404: { $ref: "#/components/responses/NotFound" },
                },
            },
            delete: {
                tags: ["Usuarios"],
                summary: "Eliminar usuario (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/IdParam" }],
                responses: {
                    200: { description: "Usuario eliminado" },
                    404: { $ref: "#/components/responses/NotFound" },
                },
            },
        },
        "/reservations": {
            get: {
                tags: ["Reservas"],
                summary: "Listar reservas (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    { $ref: "#/components/parameters/PageParam" },
                    { $ref: "#/components/parameters/LimitParam" },
                ],
                responses: {
                    200: { description: "Listado de reservas" },
                    403: { $ref: "#/components/responses/Forbidden" },
                },
            },
            post: {
                tags: ["Reservas"],
                summary: "Crear reserva (devuelve checkoutUrl de Stripe)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["carId", "startDate", "endDate"],
                                properties: {
                                    carId: { type: "string" },
                                    startDate: { type: "string", format: "date" },
                                    endDate: { type: "string", format: "date" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Reserva creada + checkoutUrl" },
                    400: { $ref: "#/components/responses/ValidationError" },
                    409: { description: "Fechas ocupadas" },
                },
            },
        },
        "/reservations/my": {
            get: {
                tags: ["Reservas"],
                summary: "Mis reservas",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: { 200: { description: "Listado de reservas del usuario" } },
            },
        },
        "/reservations/session/{sessionId}": {
            get: {
                tags: ["Reservas"],
                summary: "Reserva por session_id de Stripe (dueño o admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/SessionIdParam" }],
                responses: {
                    200: { description: "Reserva" },
                    403: { $ref: "#/components/responses/Forbidden" },
                    404: { $ref: "#/components/responses/NotFound" },
                },
            },
        },
        "/reservations/{id}": {
            get: {
                tags: ["Reservas"],
                summary: "Detalle de reserva (dueño o admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/IdParam" }],
                responses: {
                    200: { description: "Reserva" },
                    403: { $ref: "#/components/responses/Forbidden" },
                    404: { $ref: "#/components/responses/NotFound" },
                },
            },
        },
        "/reservations/{id}/cancel": {
            patch: {
                tags: ["Reservas"],
                summary: "Cancelar reserva (dueño o admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/IdParam" }],
                responses: {
                    200: { description: "Reserva cancelada" },
                    400: { description: "No cancelable" },
                    403: { $ref: "#/components/responses/Forbidden" },
                    404: { $ref: "#/components/responses/NotFound" },
                },
            },
        },
        "/contact": {
            post: {
                tags: ["Contacto"],
                summary: "Enviar mensaje de contacto (email al admin)",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "email", "phone", "carInfo"],
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string", format: "email" },
                                    phone: { type: "string" },
                                    carInfo: { type: "string" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Enviado" },
                    400: { $ref: "#/components/responses/ValidationError" },
                },
            },
        },
        "/admin/stats": {
            get: {
                tags: ["Admin"],
                summary: "Métricas del panel (admin)",
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: { description: "Estadísticas" },
                    403: { $ref: "#/components/responses/Forbidden" },
                },
            },
        },
        "/stripe/webhook": {
            post: {
                tags: ["Stripe"],
                summary: "Webhook de Stripe (checkout.session.completed)",
                description: "Confirma el pago, bloquea fechas y envía el email de confirmación al cliente.",
                responses: {
                    200: { description: "Evento recibido" },
                    400: { description: "Firma inválida" },
                },
            },
        },
    },
}
