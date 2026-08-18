import mongoose from "mongoose";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
    console.log("Uso: node scripts/resetPassword.js <email> <nuevaContraseña>");
    process.exit(1);
}

try {
    await mongoose.connect(process.env.MONGODB_URI);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    const result = await User.updateOne({ email }, { $set: { password: hash } });

    if (result.matchedCount === 0) {
        console.log(`No se encontró ningún usuario con email: ${email}`);
    } else {
        console.log(`✅ Contraseña actualizada para ${email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
} catch (error) {
    console.error("Error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
}