import express from "express"
import carRoutes from "./routes/carRoutes.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import mongoConexion from "./config/db.js";
import cors from "cors";
import { userRoutes } from "./routes/userRoutes.js"
import { authRoutes } from "./routes/authRoutes.js";
import { contactRoutes } from "./routes/contactRoutes.js";

dotenv.config();

const app=express();
const port = process.env.PORT 

const whitelist = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(cors({
    origin: whitelist,
}))

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (whitelist.includes(origin) || process.env.NODE_ENV !== 'production')) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Para procesar datos en formato JSON
app.use(express.json());

// Para procesar datos de formularios HTML 
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"))
mongoConexion()
    .catch((error)=>console.log('Error al conectar a la bdd'))


app.get("/testapi", (req, res) => {
  res.send("API MariCar working");
});


app.use("/api/v1/cars", carRoutes )
app.use("/api/v1/users", userRoutes )
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/contact", contactRoutes)
app.listen(port,()=>{
    console.log(`Servidor a la escucha ${port}`)
})
