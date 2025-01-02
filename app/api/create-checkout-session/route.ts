import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.SUPABASE_API_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface UserData {
  email: string;
  user_metadata: {
    name?: string;
  };
}

export async function POST(req: Request) {
  try {
    const authSession = await getServerSession();
    if (!authSession?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { guildId } = await req.json();
    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    // Get guild details
    const { data: guild, error: guildError } = await supabase
      .from('guilds')
      .select('name')
      .eq('id', guildId)
      .single();

    if (guildError || !guild) {
      return NextResponse.json(
        { error: 'Guild not found' },
        { status: 404 }
      );
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: authSession.user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        guildId,
        guildName: guild.name,
      },
      subscription_data: {
        metadata: {
          guildId,
          guildName: guild.name,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      const statusCode = error.statusCode || 400;
      let message = 'An error occurred with the payment service';
      
      // Handle specific Stripe errors
      if (error.message.includes('price specified is inactive')) {
        message = 'The subscription plan is currently unavailable. Please try again later or contact support.';
      }
      
      return NextResponse.json(
        { error: message },
        { status: statusCode }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 