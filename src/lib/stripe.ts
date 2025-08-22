import { loadStripe } from '@stripe/stripe-js';

// Get the publishable key with better error handling
const getPublishableKey = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined. Please check your environment variables.');
    return null;
  }
  return key;
};

// Initialize Stripe.js with the publishable key
const publishableKey = getPublishableKey();
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// Stripe configuration
export const stripeConfig = {
  currency: 'lkr', // Sri Lankan Rupee
  paymentMethodTypes: ['card'],
};
