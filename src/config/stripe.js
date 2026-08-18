import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getRedirectUrls = () => ({
  successUrl: `${process.env.FRONTEND_URL}/reservar/confirmacion`,
  cancelUrl: `${process.env.FRONTEND_URL}/reservar/cancelado`,
});