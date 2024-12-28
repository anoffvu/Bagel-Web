import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { updateGuildSubscription } from '../../../services/guild';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.SUPABASE_API_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const relevantEvents = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature') as string;

  if (!sig) {
    console.error('No Stripe signature found in request headers');
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  try {
    console.log('Constructing Stripe event with signature:', sig.substring(0, 20) + '...');
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Received Stripe event:', event.type);

    if (relevantEvents.has(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      const guildId = subscription.metadata.guildId;

      if (!guildId) {
        console.error('Guild ID not found in subscription metadata:', subscription.id);
        throw new Error('Guild ID not found in subscription metadata');
      }

      console.log(`Updating guild ${guildId} subscription status to ${subscription.status}`);
      
      // Update guild subscription status with expiry date
      await updateGuildSubscription(
        guildId,
        subscription.status === 'active',
        new Date(subscription.current_period_end * 1000) // Convert Unix timestamp to Date
      );

      console.log(`Successfully updated guild ${guildId} subscription`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Webhook error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 