// PDF Invoice Generator Edge Function
// Deploy with: supabase functions deploy generate-invoice

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Note: For production, use a proper PDF library like @react-pdf/renderer or pdfkit

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { order_id } = await req.json()

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, sku)
        ),
        profiles (full_name, email),
        coupons (code, discount_type, discount_value)
      `)
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    // Generate invoice HTML (simplified version)
    // In production, use a proper PDF library
    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #0ea5e9; }
    .invoice-title { font-size: 32px; color: #666; }
    .invoice-info { margin-bottom: 30px; }
    .info-row { display: flex; gap: 40px; margin-bottom: 10px; }
    .info-label { font-weight: bold; width: 120px; }
    .addresses { display: flex; gap: 60px; margin-bottom: 30px; }
    .address-block { flex: 1; }
    .address-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #0ea5e9; }
    td { padding: 12px; border-bottom: 1px solid #eee; }
    .totals { float: right; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.grand-total { border-top: 2px solid #333; font-weight: bold; font-size: 18px; margin-top: 10px; padding-top: 15px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">PrintForge</div>
    <div class="invoice-title">INVOICE</div>
  </div>
  
  <div class="invoice-info">
    <div class="info-row">
      <span class="info-label">Invoice #:</span>
      <span>INV-${order.id.slice(0, 8).toUpperCase()}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Order #:</span>
      <span>${order.id.slice(0, 8).toUpperCase()}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Date:</span>
      <span>${new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Status:</span>
      <span>${order.status.toUpperCase()}</span>
    </div>
  </div>

  <div class="addresses">
    <div class="address-block">
      <div class="address-title">Bill To</div>
      <div>${order.shipping_address?.name || order.profiles?.full_name || 'Customer'}</div>
      <div>${order.shipping_address?.address_line1 || ''}</div>
      ${order.shipping_address?.address_line2 ? `<div>${order.shipping_address.address_line2}</div>` : ''}
      <div>${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''} ${order.shipping_address?.postal_code || ''}</div>
      <div>${order.shipping_address?.country || ''}</div>
    </div>
    <div class="address-block">
      <div class="address-title">From</div>
      <div>PrintForge Inc.</div>
      <div>123 Innovation Way</div>
      <div>San Francisco, CA 94102</div>
      <div>United States</div>
      <div>support@printforge.com</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Material</th>
        <th>Color</th>
        <th>Infill</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.order_items.map((item: any) => `
        <tr>
          <td>${item.products?.name || 'Custom Print'}</td>
          <td>${item.material}</td>
          <td>${item.color}</td>
          <td>${item.infill}%</td>
          <td>${item.quantity}</td>
          <td>$${item.unit_price.toFixed(2)}</td>
          <td>$${item.total_price.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>$${order.subtotal.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>Shipping (${order.shipping_method}):</span>
      <span>$${order.shipping_cost.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>Tax:</span>
      <span>$${order.tax_amount.toFixed(2)}</span>
    </div>
    ${order.discount_amount > 0 ? `
    <div class="total-row">
      <span>Discount${order.coupons ? ` (${order.coupons.code})` : ''}:</span>
      <span>-$${order.discount_amount.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="total-row grand-total">
      <span>Total:</span>
      <span>$${order.total.toFixed(2)}</span>
    </div>
  </div>

  <div style="clear: both;"></div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>PrintForge Inc. | 123 Innovation Way, San Francisco, CA 94102 | support@printforge.com</p>
    <p>Terms: Payment due within 30 days. Questions? Contact us at support@printforge.com</p>
  </div>
</body>
</html>
    `

    // For now, return HTML. In production, convert to PDF using a library
    // You could use puppeteer, @react-pdf/renderer, or similar
    return new Response(invoiceHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        // To serve as PDF:
        // 'Content-Type': 'application/pdf',
        // 'Content-Disposition': `attachment; filename="invoice-${order.id.slice(0, 8)}.pdf"`
      },
    })

  } catch (error) {
    console.error('Invoice generation error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
