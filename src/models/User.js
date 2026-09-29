import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    surname: {
        type: String,
        trim: true,
        maxlength: 80,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    birthday: {
        type: Date,
        required: true,
    },
    direction: {
        type: String,
        trim: true,
        maxlength: 200,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
    }
})

//hashear password
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//comparar si las password son iguales
userSchema.methods.comparePassword = async function (passwordNew) {
    return bcrypt.compare(passwordNew, this.password);
};

export default model("User", userSchema)