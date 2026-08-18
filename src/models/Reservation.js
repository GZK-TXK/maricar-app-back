import { Schema, model } from "mongoose";

const reservationSchema = new Schema({
  user:   { type: Schema.Types.ObjectId, ref: "User", required: true },
  car:    { type: Schema.Types.ObjectId, ref: "Cars", required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  days:      { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  totalPrice:  { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
  stripeSessionId:      { type: String, default: "" },
  stripePaymentIntentId: { type: String, default: "" },
}, { timestamps: true });

export default model("Reservation", reservationSchema);