import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    surname: {
        type: String,
        required: false,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    birthday: {
        type: Date,
        required: true,
        trim: true,
    },
    direction: {
        type: String,
        required: false,
        trim: true,
    },
    phone: {
        type: Number,
        required: true,
        trim: true,
    }
})

//hashear password

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//comparar si las password son iguales

userSchema.methods.comparePassword = async function (passwordNew) {
    return bcrypt.compare(passwordNew, this.password);
};

export default model("User", userSchema)