import { NextResponse } from 'next/server';
import { validateEnvironmentVariables } from '@/lib/env-validation';

export async function GET() {
  const envStatus = validateEnvironmentVariables();
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    environmentVariables: {
      isValid: envStatus.isValid,
      missing: envStatus.missing,
      warnings: envStatus.warnings,
    },
    // Don't expose actual values in production
    hasKeys: {
      stripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripeSecret: !!process.env.STRIPE_SECRET_KEY,
      webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      domain: !!process.env.NEXT_PUBLIC_DOMAIN,
    }
  });
}
