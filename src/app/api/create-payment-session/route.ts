import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logEnvironmentStatus } from '@/lib/env-validation';

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
    // Log environment status for debugging
    const envStatus = logEnvironmentStatus();
    if (!envStatus.isValid) {
      console.error('Environment validation failed:', envStatus.missing);
      return NextResponse.json(
        { 
          error: 'Server configuration error: Missing environment variables',
          details: process.env.NODE_ENV === 'development' ? envStatus.missing : undefined
        },
        { status: 500 }
      );
    }

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

    // Get the base URL for redirects
    const getBaseUrl = () => {
      // First try the environment variable
      if (process.env.NEXT_PUBLIC_DOMAIN) {
        console.log('Using NEXT_PUBLIC_DOMAIN:', process.env.NEXT_PUBLIC_DOMAIN);
        return process.env.NEXT_PUBLIC_DOMAIN;
      }
      
      // Fall back to request headers
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 
                      request.headers.get('x-forwarded-protocol') || 
                      request.headers.get('x-forwarded-ssl') === 'on' ? 'https' :
                      (host?.includes('localhost') || host?.includes('127.0.0.1') ? 'http' : 'https');
      
      if (host) {
        const detectedUrl = `${protocol}://${host}`;
        console.log('Auto-detected URL from headers:', detectedUrl);
        console.log('Headers - host:', host, 'x-forwarded-proto:', request.headers.get('x-forwarded-proto'));
        return detectedUrl;
      }
      
      // Final fallback (shouldn't happen in production)
      console.warn('Using fallback URL - this should not happen in production');
      return 'http://localhost:3000';
    };

    const baseUrl = getBaseUrl();
    console.log('Final base URL for redirects:', baseUrl);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}`,
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
