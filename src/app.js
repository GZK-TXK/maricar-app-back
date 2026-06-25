import express from "express"
import carRoutes from "./routes/carRoutes.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import mongoConexion from "./config/db.js";
import cors from "cors";
import { userRoutes } from "./routes/userRoutes.js"


dotenv.config();

const app=express();
const port = process.env.PORT 

const whitelist= [
    'http://localhost:5173',
    'https://maricar-app-front.vercel.app'
]

app.use(cors({
    origin: whitelist,
}))

// Para procesar datos en formato JSON (ej. APIs)
app.use(express.json());

// Para procesar datos de formularios HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

mongoConexion()
    .catch((error)=>console.log('error al conectar a la bdd'))


app.get("/testapi", (req, res) => {
  res.send("API MariCar working");
});


app.use("/api/v1/cars", carRoutes )
app.use("/api/v1/users", userRoutes )

app.listen(port,()=>{
    console.log(`Servidor a la escucha ${port}`)
})
