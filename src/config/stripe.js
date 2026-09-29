import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")[0]
  .trim();

export const getRedirectUrls = () => ({
  successUrl: `${frontendUrl}/reservar/confirmacion`,
  cancelUrl: `${frontendUrl}/reservar/cancelado`,
});