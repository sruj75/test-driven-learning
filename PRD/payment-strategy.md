# Payment Strategy: Stripe Implementation for MVP

## Overview

This document outlines our payment implementation strategy for the Test-Driven Learning platform MVP. We've selected Stripe as our payment processor due to its developer-friendly API, robust security, and seamless integration with our technology stack.

## Frontend-First Implementation Approach

Following our user experience-driven development philosophy, we'll implement the payment flow in three distinct phases:

### Phase 1: Payment UI Design (Days 1-6)
- Design subscription plan comparison UI
- Create seamless checkout flow mockups
- Build account/billing management screens
- Implement subscription status indicators throughout the app
- Design payment success/failure states and messaging

### Phase 2: Payment Implementation (Days 7-10)
- Integrate Stripe Elements for secure payment capture
- Create frontend components for subscription management
- Implement subscription toggle controls and plan selection
- Build upgrade prompts in strategic app locations
- Design receipt and invoice presentation

### Phase 3: Backend Integration (Days 11-14)
- Connect Stripe API via Next.js API routes or Supabase Edge Functions
- Implement webhook handlers for Stripe events
- Store subscription data in Supabase
- Create subscription verification middleware
- Build admin tools for subscription management

## Stripe Implementation Details

### Required Packages
- `@stripe/stripe-js` - Core Stripe JavaScript library
- `@stripe/react-stripe-js` - React components for Stripe
- `stripe` (Node.js) - Server-side Stripe library for API routes

### Key Components

#### 1. Stripe Provider Setup
```jsx
// _app.tsx or layout component
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe outside component to avoid recreating Stripe object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function MyApp({ Component, pageProps }) {
  return (
    <Elements stripe={stripePromise}>
      <Component {...pageProps} />
    </Elements>
  );
}
```

#### 2. Checkout Component
```jsx
// components/payment/CheckoutForm.tsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ price, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    // Call to our payment intent API
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price })
    });
    
    const { clientSecret, subscriptionId } = await response.json();
    
    // Confirm payment with Stripe
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: 'User Name' } // Will come from form
      }
    });
    
    setLoading(false);
    
    if (result.error) {
      onError(result.error);
    } else {
      // Handle successful subscription
      onSuccess(subscriptionId);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Card Details
        </label>
        <CardElement className="border rounded p-3" />
      </div>
      <button 
        type="submit" 
        disabled={!stripe || loading} 
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </form>
  );
};
```

#### 3. Backend API Route
```javascript
// pages/api/create-subscription.js
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  
  // Get user from Supabase auth
  const supabase = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    // Create or retrieve customer
    let customer;
    const { data: customers } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();
      
    if (customers?.stripe_customer_id) {
      customer = customers.stripe_customer_id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { supabaseUserId: user.id }
      });
      
      await supabase
        .from('customers')
        .insert({ user_id: user.id, stripe_customer_id: newCustomer.id });
        
      customer = newCustomer.id;
    }
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer,
      items: [{ price: req.body.price }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
    
    // Return client secret for frontend confirmation
    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Subscription creation failed' });
  }
}
```

## Subscription Model for MVP

### Pricing Tiers
For MVP, we'll implement a simple, single-tier subscription model:

**Premium Plan - $9.99/month**
- Ad-free experience
- Unlimited tests
- Enhanced analytics
- Offline access

This allows us to validate the core subscription model before expanding to multiple tiers.

### Early Adopter Incentives
- First month at $4.99 (50% discount)
- Extended trial period (14 days vs standard 7 days)
- Founding member badge on profile
- Guaranteed price lock for 12 months

## Database Schema for Subscriptions

We'll add the following tables to our Supabase schema:

```sql
-- Store customer information
create table customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  stripe_customer_id text not null,
  created_at timestamp with time zone default now()
);

-- Store subscription information
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  stripe_subscription_id text not null,
  status text not null,
  price_id text not null,
  quantity integer not null,
  cancel_at_period_end boolean not null default false,
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  ended_at timestamp with time zone
);
```

## Webhook Implementation

We'll implement a webhook handler to process Stripe events:

1. Subscription updated/cancelled
2. Payment succeeded/failed
3. Invoice paid/payment failed

This will ensure our database stays in sync with Stripe's subscription status.

## User Experience Considerations

### Subscription Status Visibility
- Clear subscription status indicator in user profile/dashboard
- Non-intrusive upgrade prompts for free tier users
- Transparent messaging about benefits of premium features

### Graceful Handling of Payment Issues
- Friendly notifications for failed payments
- Easy retry mechanism for declined cards
- Grace period before cancelling subscription on payment failure

### Subscription Management
- One-click cancellation (with feedback survey)
- Easy plan switching if we add multiple tiers
- Clear next billing date and amount information
- Access to payment history and invoices

## Testing Plan

1. Use Stripe test mode and test cards to verify payment flows
2. Test webhook handling with Stripe CLI webhook forwarding
3. Verify subscription status updates correctly in database
4. Test subscription cancellation and renewal flows
5. Verify subscription status affects feature access appropriately

## Future Enhancements (Post-MVP)

1. Multiple subscription tiers (Basic, Pro, Team)
2. Annual payment option with discount
3. Team/educational institution plans
4. Payment method management interface
5. Coupon/promotion code redemption 