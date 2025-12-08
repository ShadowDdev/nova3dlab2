// Stripe Webhook Handler for Supabase Edge Functions
// Deploy with: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.4.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-08-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 })
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get the order ID from metadata
        const orderId = session.metadata?.order_id
        if (!orderId) {
          console.error('No order_id in session metadata')
          break
        }

        // Update order status
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_session_id: session.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        if (orderError) {
          console.error('Error updating order:', orderError)
          throw orderError
        }

        // If customer email exists, create/update Stripe customer record
        if (session.customer_email) {
          const { data: user } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.customer_email)
            .single()

          if (user && session.customer) {
            await supabase
              .from('profiles')
              .update({ stripe_customer_id: session.customer as string })
              .eq('id', user.id)
          }
        }

        console.log(`Order ${orderId} marked as paid`)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent ${paymentIntent.id} failed: ${paymentIntent.last_payment_error?.message}`)
        
        // Update order status to failed
        if (paymentIntent.metadata?.order_id) {
          await supabase
            .from('orders')
            .update({
              status: 'payment_failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentIntent.metadata.order_id)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Subscription ${subscription.id} ${event.type}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Subscription ${subscription.id} cancelled`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Invoice ${invoice.id} paid`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Invoice ${invoice.id} payment failed`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
