import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe.js with the publishable key
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Stripe configuration
export const stripeConfig = {
  currency: 'lkr', // Sri Lankan Rupee
  paymentMethodTypes: ['card'],
};
