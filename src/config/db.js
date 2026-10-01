import mongoose from "mongoose"
import { env } from "./env.js"

const mongoConexion = async () => {
  try {
    await mongoose.connect(env.mongoUri)
    console.log("Data Base succesfully connected.")
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

export default mongoConexion