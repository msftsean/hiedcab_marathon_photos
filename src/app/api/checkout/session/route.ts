import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripeServer } from '@/lib/stripe/client';
import { calculateBundlePrice } from '@/lib/utils/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, photoIds } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one photo is required' },
        { status: 400 }
      );
    }

    if (photoIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 photos per order' },
        { status: 400 }
      );
    }

    // Validate photo IDs are UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const id of photoIds) {
      if (!uuidRegex.test(id)) {
        return NextResponse.json(
          { error: 'Invalid photo ID format' },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();

    // Fetch photos to verify they exist and are purchasable
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select(`
        id,
        price_cents,
        photographer_id,
        watermarked_url,
        events (name)
      `)
      .in('id', photoIds)
      .eq('is_visible', true);

    if (photosError) {
      console.error('Error fetching photos:', photosError);
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      );
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'No valid photos found' },
        { status: 404 }
      );
    }

    if (photos.length !== photoIds.length) {
      return NextResponse.json(
        { error: 'Some photos are not available for purchase' },
        { status: 400 }
      );
    }

    // Calculate bundle pricing
    const pricing = calculateBundlePrice(photos.length);

    // Create Stripe Checkout Session
    const stripe = getStripeServer();

    // Build line items
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: photos.length === 1
              ? 'Race Photo'
              : `Race Photo Bundle (${photos.length} photos)`,
            description: photos.length === 1
              ? `Photo from ${(photos[0].events as any)?.name || 'Event'}`
              : `Bundle includes ${photos.length} high-resolution photos`,
          },
          unit_amount: pricing.totalCents,
        },
        quantity: 1,
      },
    ];

    // Generate success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: {
        photoIds: JSON.stringify(photoIds),
        email: email,
        photoCount: String(photos.length),
        bundleType: pricing.bundleType,
      },
      // Collect billing address for fraud prevention
      billing_address_collection: 'auto',
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
