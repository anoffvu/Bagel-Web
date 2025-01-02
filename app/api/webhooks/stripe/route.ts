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
  'charge.dispute.funds_withdrawn',
  'charge.dispute.funds_reinstated',
  'charge.dispute.updated',
  'charge.dispute.closed',
]);

async function handleDispute(dispute: Stripe.Dispute) {
  if (!dispute.charge) {
    console.error('No charge ID found in dispute:', dispute.id);
    return;
  }

  try {
    // Get the full charge details with invoice
    const fullCharge = await stripe.charges.retrieve(dispute.charge as string, {
      expand: ['invoice']
    });

    if (!fullCharge.invoice) {
      const error = new Error('No invoice found for charge');
      error.cause = {
        chargeId: dispute.charge,
        disputeId: dispute.id
      };
      throw error;
    }

    const invoice = fullCharge.invoice as Stripe.Invoice;
    if (!invoice.subscription) {
      const error = new Error('No subscription found in invoice');
      error.cause = {
        chargeId: dispute.charge,
        disputeId: dispute.id,
        invoiceId: invoice.id
      };
      throw error;
    }

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const guildId = subscription.metadata.guildId;

    if (!guildId) {
      const error = new Error('Guild ID not found in subscription metadata');
      error.cause = {
        subscriptionId: subscription.id,
        metadata: subscription.metadata,
        chargeId: dispute.charge,
        disputeId: dispute.id
      };
      throw error;
    }

    switch (dispute.status) {
      case 'lost':
      case 'warning_closed':
        // If dispute is lost or closed with warning, deactivate subscription
        await updateGuildSubscription(
          guildId,
          false,
          new Date() // Immediate expiry
        );
        console.log(`Deactivated subscription for guild ${guildId} due to dispute ${dispute.id}`);
        break;
      
      case 'won':
        // If dispute is won, reactivate subscription if it was active
        if (subscription.status === 'active') {
          await updateGuildSubscription(
            guildId,
            true,
            new Date(subscription.current_period_end * 1000)
          );
          console.log(`Reactivated subscription for guild ${guildId} after winning dispute ${dispute.id}`);
        }
        break;
      
      default:
        console.log(`Dispute ${dispute.id} for guild ${guildId} has status: ${dispute.status}`);
    }
  } catch (error) {
    console.error('Error handling dispute:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error metadata:', error.cause);
      console.error('Error stack:', error.stack);
    }
    throw error; // Re-throw to be handled by the main webhook handler
  }
}

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
      if (event.type.startsWith('charge.dispute')) {
        await handleDispute(event.data.object as Stripe.Dispute);
      } else {
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
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error metadata:', error.cause);
      console.error('Error stack:', error.stack);
      
      errorDetails = error.message;
      if (error.cause) {
        errorDetails += ` (Metadata: ${JSON.stringify(error.cause)})`;
      }
    }
    
    return NextResponse.json(
      { error: 'Webhook error', details: errorDetails },
      { status: 500 }
    );
  }
} 