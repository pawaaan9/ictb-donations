import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const { items, metadata = {} } = await request.json();

    // Validate the items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty cart items' },
        { status: 400 }
      );
    }

    // Calculate total amount and create line items for Stripe
    const lineItems = items.map((item: { id: string; section: string; price: number }) => ({
      price_data: {
        currency: 'lkr',
        product_data: {
          name: `Sacred Brick - ${item.section}`,
          description: `Sponsoring a brick in the ${item.section} section of the Sacred Chaithya`,
          images: [], // You can add images here if needed
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: 1,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}`,
      metadata: {
        ...metadata,
        totalBricks: items.length.toString(),
        donationType: 'chaithya_bricks',
      },
      // Optional: Collect customer information
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['LK'], // Sri Lanka
      },
      // Custom fields for donation details
      custom_fields: [
        {
          key: 'donor_message',
          label: {
            type: 'custom',
            custom: 'Optional Message for the Sacred Chaithya',
          },
          type: 'text',
          optional: true,
        },
      ],
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
