import { env } from "./config/env.js"
import { createApp } from "./app.js"
import mongoConexion from "./config/db.js"

const app = createApp()

mongoConexion().catch(() => console.error("Error al conectar a la BDD"))

app.listen(env.port, () => {
    console.log(`Servidor a la escucha ${env.port}`)
})