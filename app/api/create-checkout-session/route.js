import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import parseJson from '@/lib/safeRequest'

// Do NOT initialize Stripe at module load time because Next.js may import this
// module during build/data collection when environment variables are not set.
// Initialize inside the handler to avoid build-time errors when `STRIPE_SECRET_KEY`
// is not provided (local dev or CI environments).

export async function POST(request) {
  try {
    const body = await parseJson(request)

    if (!body) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 })
    }

    const { items, orderData } = body

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const stripeSecret = process.env.STRIPE_SECRET_KEY
    if (!stripeSecret) {
      console.error('Stripe secret key not configured (STRIPE_SECRET_KEY)')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecret)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        customerName: orderData.customer.name,
        customerPhone: orderData.customer.phone,
        customerCity: orderData.customer.city,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Erreur Stripe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}