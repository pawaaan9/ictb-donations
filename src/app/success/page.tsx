'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentDetails {
  session_id: string;
  amount_total: number;
  customer_email: string;
  payment_status: string;
  metadata: Record<string, string>;
}

export default function SuccessPage() {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Verify the payment session
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setPaymentDetails(data);
          }
        })
        .catch((err) => {
          setError('Failed to verify payment');
          console.error('Payment verification error:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700 font-medium">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Donations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">🙏</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-amber-800 mb-4">
            Sacred Donation Complete!
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Thank you for your generous contribution to building the Sacred Chaithya. 
            Your donation will help spread peace, wisdom, and compassion for generations to come.
          </p>
        </div>

        {paymentDetails && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Payment Summary */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  💳 Payment Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {paymentDetails.session_id.slice(-12)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Amount Donated:</span>
                    <span className="font-bold text-green-600">
                      Rs.{(paymentDetails.amount_total / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="font-bold text-green-600 capitalize">
                      {paymentDetails.payment_status}
                    </span>
                  </div>
                  {paymentDetails.customer_email && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-800">{paymentDetails.customer_email}</span>
                    </div>
                  )}
                  {paymentDetails.metadata?.totalBricks && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Bricks Sponsored:</span>
                      <span className="font-bold text-amber-600">
                        {paymentDetails.metadata.totalBricks} brick{parseInt(paymentDetails.metadata.totalBricks) > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* What Happens Next */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  📧 What Happens Next
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-gray-600">
                      You&apos;ll receive a donation receipt via email within 24 hours.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-gray-600">
                      Your sponsored bricks will be permanently marked in our records.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-gray-600">
                      You&apos;ll receive updates on the construction progress of the Sacred Chaithya.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <p className="text-gray-600">
                      This donation is tax-deductible. Save your receipt for tax purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sharing Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-4 text-center">
            🌟 Share Your Sacred Act
          </h2>
          <p className="text-amber-700 text-center mb-6">
            Help spread the word about the Sacred Chaithya project and inspire others to contribute.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Share on Facebook
            </button>
            <button className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Share on Twitter
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-lg transition-colors transform hover:scale-105 shadow-lg"
          >
            🧱 Sponsor More Bricks
          </Link>
          <div>
            <a
              href="#"
              className="text-amber-600 hover:text-amber-700 font-medium underline"
            >
              📞 Contact Us
            </a>
            {' | '}
            <a
              href="#"
              className="text-amber-600 hover:text-amber-700 font-medium underline"
            >
              📧 Download Receipt
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
