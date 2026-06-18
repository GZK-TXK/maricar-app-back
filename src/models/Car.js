import {Schema,model} from "mongoose";

const carSchema = new Schema({
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  plate:{
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: [0, "Price must be greater than 0"],
  },
  imageUrl: {
    type: String,
    default: "",
  },
  available: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default model("Cars", carSchema);

