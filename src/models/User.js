import { Schema, model } from "mongoose";

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
    },
    password: {
        type: String,
        required: true,
        trim: true,
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
    phone:{
        type: Number,
        required: true,
        trim:true,
    }
})