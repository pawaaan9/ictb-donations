// Utility function to validate environment variables
export function validateEnvironmentVariables() {
  const requiredVars = {
    client: [
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
      // NEXT_PUBLIC_DOMAIN is optional as we have fallback logic
    ],
    server: [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ]
  };

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check client-side variables
  if (typeof window !== 'undefined') {
    requiredVars.client.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });
  } else {
    // Check server-side variables
    [...requiredVars.client, ...requiredVars.server].forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });
  }

  // Check for NEXT_PUBLIC_DOMAIN specifically
  if (!process.env.NEXT_PUBLIC_DOMAIN) {
    warnings.push('NEXT_PUBLIC_DOMAIN not set - using request headers for URL detection');
  }

  // Check for test keys in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.includes('pk_test')) {
      warnings.push('Using test Stripe publishable key in production');
    }
    if (process.env.STRIPE_SECRET_KEY?.includes('sk_test')) {
      warnings.push('Using test Stripe secret key in production');
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

export function logEnvironmentStatus() {
  const status = validateEnvironmentVariables();
  
  if (!status.isValid) {
    console.error('❌ Missing required environment variables:', status.missing);
  } else {
    console.log('✅ All required environment variables are set');
  }

  if (status.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:', status.warnings);
  }

  return status;
}
