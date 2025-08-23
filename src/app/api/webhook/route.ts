// GET endpoint to fetch all purchased bricks and total sponsored bricks
export async function GET(request: NextRequest) {
  try {
    // Get all keys for purchased bricks
    const keys = await redis.keys('bricks:session:*');
    const purchases = [];
    for (const key of keys) {
      const count = await redis.get<number>(key);
      purchases.push({ session: key.replace('bricks:session:', ''), bricks: count });
    }
    // Get total sponsored bricks
    const sponsored = await redis.get<number>('bricks:sponsored');
    return NextResponse.json({
      sponsored: typeof sponsored === 'number' ? sponsored : Number(sponsored) || 0,
      purchases,
    });
  } catch (error) {
    console.error('Error fetching bricks data:', error);
    return NextResponse.json({ error: 'Failed to fetch bricks data', details: String(error) }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });
}


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined');
      return NextResponse.json(
        { error: 'Server configuration error: Stripe key missing' },
        { status: 500 }
      );
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not defined');
      return NextResponse.json(
        { error: 'Server configuration error: Webhook secret missing' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Webhook signature missing' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Debug: log session metadata and brickCount
        console.log('Webhook received checkout.session.completed');
        console.log('Session metadata:', session.metadata);
        const brickCount = session.metadata?.brickCount ? parseInt(session.metadata.brickCount, 10) : 0;
        console.log('Parsed brickCount:', brickCount);
        if (brickCount > 0) {
          try {
            // Save the number of bricks bought for this session
            await redis.set(`bricks:session:${session.id}`, brickCount);
            // Update the total sponsored bricks
            await redis.incrby('bricks:sponsored', brickCount);
            console.log(`Saved ${brickCount} bricks for session ${session.id}`);
            console.log(`Updated bricks:sponsored by ${brickCount}`);
          } catch (err) {
            console.error('Failed to update bricks:sponsored or save session in Redis:', err);
          }
        } else {
          console.warn('brickCount is missing or zero, not updating Redis');
        }
        // Example: Log the donation details
        console.log('Payment successful:', session.id);
        console.log('Donation details:', {
          sessionId: session.id,
          amountTotal: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email,
          metadata: session.metadata,
        });
        break;
      }

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        
        // Handle failed payment - maybe send notification email
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
