import { inngest } from './client.js'
import pool from '../config/db.js'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const sendEmail = async (to, subject, htmlContent) => {
  if (!process.env.BREVO_API_KEY) throw new Error('BREVO_API_KEY is not set')
  if (!process.env.BREVO_SENDER_EMAIL) throw new Error('BREVO_SENDER_EMAIL is not set')

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'myMart',
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Brevo API ${res.status}: ${body}`)
    }
    console.log(`✅ Email sent to ${to}`)
  } catch (err) {
    console.error('❌ Email error:', err.message)
    throw err
  }
}

// ✅ 1. Welcome Email
export const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email', name: 'Send Welcome Email', triggers: [{ event: 'user/registered' }] },
  async ({ event }) => {
    try {
      const { name, email } = event.data
      await sendEmail(email, '🛒 Welcome to myMart!', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3c2e; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">🛒 myMart</h1>
          <p style="color: #a7f3d0; margin: 5px 0 0;">Fresh Groceries Delivered Daily</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1a3c2e;">Welcome, ${name}! 🎉</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for joining myMart! Get fresh groceries delivered straight to your doorstep.
          </p>
          <div style="background: #fff3e0; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #f97316;">
            <p style="margin: 0; color: #e65100; font-weight: bold;">
              🎁 Use code <strong>WELCOME10</strong> for 10% OFF your first order!
            </p>
          </div>
          <a href="${process.env.FRONTEND_URL}/products"
            style="display: inline-block; background: #f97316; color: white; padding: 14px 35px;
            border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            🛍️ Start Shopping Now
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            myMart Team | Fresh groceries delivered daily
          </p>
        </div>
      </div>`)
      return { success: true, email }
    } catch (err) {
      console.error('sendWelcomeEmail failed:', err.message)
      throw err
    }
  }
)

// ✅ 2. Order Confirmation Email
export const sendOrderConfirmation = inngest.createFunction(
  { id: 'send-order-confirmation', name: 'Send Order Confirmation', triggers: [{ event: 'order/placed' }] },
  async ({ event }) => {
    try {
      const { orderId, customerName, customerEmail, items, totalAmount, paymentMethod, otp } = event.data
      const itemsHtml = items?.map(item => `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${item.emoji || '🛒'} ${item.product_name || 'Product'}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`).join('') || '<tr><td colspan="3" style="text-align:center;padding:10px;color:#999;">No items</td></tr>'

      await sendEmail(customerEmail, `✅ Order #${orderId} Confirmed — myMart`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3c2e; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">🛒 myMart</h1>
          <p style="color: #a7f3d0; margin: 8px 0 0; font-size: 18px;">✅ Order Confirmed!</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1a3c2e;">Hi ${customerName}! 👋</h2>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #eee;">
            <h3 style="color: #1a3c2e; margin-top: 0;">📦 Order #${orderId}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead><tr style="background: #f5f0e8;">
                <th style="padding: 10px 8px; text-align: left;">Item</th>
                <th style="padding: 10px 8px; text-align: center;">Qty</th>
                <th style="padding: 10px 8px; text-align: right;">Price</th>
              </tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="border-top: 2px solid #1a3c2e; margin-top: 15px; padding-top: 15px; text-align: right;">
              <strong style="color: #1a3c2e; font-size: 22px;">Total: ₹${totalAmount}</strong>
            </div>
            <p style="color: #666; margin: 10px 0 0;">💳 Payment: <strong>${paymentMethod?.toUpperCase()}</strong></p>
          </div>
          <div style="background: #1a3c2e; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center;">
            <p style="color: #a7f3d0; margin: 0 0 8px; font-size: 14px;">🔐 YOUR DELIVERY OTP</p>
            <h1 style="color: white; margin: 0; letter-spacing: 15px; font-size: 40px; font-family: monospace;">${otp}</h1>
            <p style="color: #a7f3d0; margin: 10px 0 0; font-size: 12px;">🔒 Share ONLY with delivery partner</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/my-orders/${orderId}"
            style="display: inline-block; background: #f97316; color: white; padding: 14px 35px;
            border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            📦 Track Your Order
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            myMart Team | Fresh groceries delivered daily
          </p>
        </div>
      </div>`)
      return { success: true, orderId }
    } catch (err) {
      console.error('sendOrderConfirmation failed:', err.message)
      throw err
    }
  }
)

// ✅ 3. Out for Delivery Email
export const sendOutForDelivery = inngest.createFunction(
  { id: 'send-out-for-delivery', name: 'Send Out For Delivery', triggers: [{ event: 'order/out-for-delivery' }] },
  async ({ event }) => {
    try {
      const { orderId, customerName, customerEmail, otp } = event.data
      await sendEmail(customerEmail, `🚴 Order #${orderId} is Out for Delivery!`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f97316; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">🚴 On the Way!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1a3c2e;">Hi ${customerName}! 📦</h2>
          <p style="color: #666;">Your order <strong>#${orderId}</strong> is out for delivery!</p>
          <div style="background: #1a3c2e; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center;">
            <p style="color: #a7f3d0; margin: 0 0 8px; font-size: 14px;">🔐 YOUR DELIVERY OTP</p>
            <h1 style="color: white; margin: 0; letter-spacing: 15px; font-size: 40px; font-family: monospace;">${otp}</h1>
            <p style="color: #a7f3d0; margin: 10px 0 0; font-size: 12px;">🔒 Share ONLY with delivery partner</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/my-orders/${orderId}"
            style="display: inline-block; background: #1a3c2e; color: white; padding: 14px 35px;
            border-radius: 8px; text-decoration: none; font-weight: bold;">
            📍 Track Live Location
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            myMart Team
          </p>
        </div>
      </div>`)
      return { success: true, orderId }
    } catch (err) {
      console.error('sendOutForDelivery failed:', err.message)
      throw err
    }
  }
)

// ✅ 4. Low Stock Alert
export const sendLowStockAlert = inngest.createFunction(
  { id: 'send-low-stock-alert', name: 'Send Low Stock Alert', triggers: [{ event: 'product/low-stock' }] },
  async ({ event }) => {
    try {
      const { productName, stock, adminEmail } = event.data
      await sendEmail(adminEmail, `⚠️ Low Stock Alert: ${productName}`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">⚠️ Low Stock Alert</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
          <div style="background: white; border-radius: 8px; padding: 25px; border: 2px solid #dc2626; text-align: center;">
            <p style="font-size: 20px; color: #1a3c2e; font-weight: bold;">${productName}</p>
            <span style="background: #fee2e2; color: #dc2626; padding: 8px 20px; border-radius: 20px; font-size: 24px; font-weight: bold;">
              Only ${stock} units left!
            </span>
          </div>
          <a href="${process.env.FRONTEND_URL}/admin/products"
            style="display: inline-block; background: #dc2626; color: white; padding: 14px 35px;
            border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
            📦 Restock Now
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            myMart Admin System
          </p>
        </div>
      </div>`)
      return { success: true, productName, stock }
    } catch (err) {
      console.error('sendLowStockAlert failed:', err.message)
      throw err
    }
  }
)

// ✅ 5. Flash Deals Email
export const sendFlashDeals = inngest.createFunction(
  { id: 'send-flash-deals', name: 'Send Flash Deals', triggers: [{ event: 'admin/flash-deals' }] },
  async ({ event }) => {
    try {
      const { subject, message, discount, users } = event.data
      for (const user of users) {
        await sendEmail(user.email, subject || '⚡ Flash Deal — Today Only at myMart!', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #1a3c2e); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">⚡ Flash Deal!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a3c2e;">Hi ${user.name}! 🎉</h2>
            <p style="color: #666; font-size: 16px;">${message}</p>
            ${discount ? `
            <div style="background: #fff3e0; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; border: 2px dashed #f97316;">
              <h1 style="color: #f97316; margin: 0; font-size: 64px;">${discount}%</h1>
              <p style="color: #1a3c2e; font-size: 20px; font-weight: bold;">OFF</p>
            </div>` : ''}
            <a href="${process.env.FRONTEND_URL}/products"
              style="display: inline-block; background: #f97316; color: white; padding: 14px 40px;
              border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
              🛍️ Shop Now!
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              myMart Team 🛒
            </p>
          </div>
        </div>`)
      }
      return { success: true, sentTo: users.length }
    } catch (err) {
      console.error('sendFlashDeals failed:', err.message)
      throw err
    }
  }
)

// ✅ 6. Auto Assign Delivery Partner
export const autoAssignDelivery = inngest.createFunction(
  { id: 'auto-assign-delivery', name: 'Auto Assign Delivery Partner', triggers: [{ event: 'order/placed' }] },
  async ({ event, step }) => {

    const { orderId } = event.data

    // ✅ Wait 30 seconds then auto assign
    await step.sleep('wait-before-assign', '30s')

    // ✅ Check if order already has a delivery partner
    const orderResult = await step.run('check-order', async () => {
      const result = await pool.query(
        'SELECT * FROM orders WHERE id = $1',
        [orderId]
      )
      return result.rows[0]
    })

    // If already assigned, skip
    if (orderResult.delivery_partner_id) {
      return { skipped: true, reason: 'Already assigned' }
    }

    // ✅ Find available delivery partner
    const partner = await step.run('find-partner', async () => {
      const result = await pool.query(
        `SELECT * FROM delivery_partners 
         WHERE is_available = true 
         ORDER BY created_at ASC 
         LIMIT 1`
      )
      return result.rows[0]
    })

    // No partner available
    if (!partner) {
      return { skipped: true, reason: 'No available delivery partners' }
    }

    // ✅ Assign partner to order + mark as unavailable
    await step.run('assign-partner', async () => {
      // Assign partner to order
      await pool.query(
        `UPDATE orders 
         SET delivery_partner_id = $1, status = 'assigned' 
         WHERE id = $2`,
        [partner.id, orderId]
      )

      // Mark partner as unavailable
      await pool.query(
        `UPDATE delivery_partners 
         SET is_available = false 
         WHERE id = $1`,
        [partner.id]
      )
    })

    console.log(`✅ Auto assigned partner ${partner.name} to order #${orderId}`)
    return { success: true, partnerId: partner.id, partnerName: partner.name, orderId }
  }
)