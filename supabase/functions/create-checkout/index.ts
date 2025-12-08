// Stripe Checkout Session Creator
// Deploy with: supabase functions deploy create-checkout

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.4.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-08-16',
  httpClient: Stripe.createFetchHttpClient(),
})

interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_image: string
  material: string
  color: string
  infill: number
  quantity: number
  unit_price: number
  total_price: number
}

interface CheckoutRequest {
  items: CartItem[]
  shipping_address: {
    name: string
    email: string
    phone?: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  shipping_option: 'standard' | 'express'
  coupon_code?: string
  user_id?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { items, shipping_address, shipping_option, coupon_code, user_id } = await req.json() as CheckoutRequest

    // Calculate totals
    const subtotal = items.reduce((acc, item) => acc + item.total_price, 0)
    const shippingCost = shipping_option === 'express' ? 24.99 : 9.99
    const taxRate = 0.08 // 8% tax
    const taxAmount = subtotal * taxRate
    
    let discount = 0
    let couponId: string | null = null

    // Validate coupon if provided
    if (coupon_code) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('is_active', true)
        .single()

      if (!couponError && coupon) {
        const now = new Date()
        const validFrom = new Date(coupon.valid_from)
        const validUntil = new Date(coupon.valid_until)

        if (now >= validFrom && now <= validUntil) {
          if (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) {
            if (coupon.discount_type === 'percentage') {
              discount = subtotal * (coupon.discount_value / 100)
              if (coupon.max_discount_amount) {
                discount = Math.min(discount, coupon.max_discount_amount)
              }
            } else {
              discount = coupon.discount_value
            }
            couponId = coupon.id
          }
        }
      }
    }

    const total = subtotal + shippingCost + taxAmount - discount

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user_id || null,
        status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        discount_amount: discount,
        total,
        coupon_id: couponId,
        shipping_address: shipping_address,
        shipping_method: shipping_option,
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      material: item.material,
      color: item.color,
      infill: item.infill,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    // Create Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
          description: `${item.material} - ${item.color} - ${item.infill}% infill`,
          images: item.product_image ? [item.product_image] : undefined,
        },
        unit_amount: Math.round(item.unit_price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }))

    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${shipping_option === 'express' ? 'Express' : 'Standard'} Shipping`,
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${Deno.env.get('FRONTEND_URL')}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${Deno.env.get('FRONTEND_URL')}/checkout?cancelled=true`,
      customer_email: shipping_address.email,
      metadata: {
        order_id: order.id,
        user_id: user_id || '',
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
      },
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },
    })

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url,
        orderId: order.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
