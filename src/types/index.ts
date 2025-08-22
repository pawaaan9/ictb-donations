export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  donated: boolean;
  section: string;
  price: number;
}

export interface CartItem {
  brick: Brick;
}

export interface PaymentSessionData {
  items: Array<{
    id: string;
    section: string;
    price: number;
  }>;
  metadata?: Record<string, string>;
}

export interface PaymentVerificationResponse {
  session_id: string;
  payment_status: string;
  amount_total: number;
  currency: string;
  customer_email?: string;
  metadata: Record<string, string>;
  created: number;
}
