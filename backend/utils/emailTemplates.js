export const orderConfirmationTemplate = (order, user) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: #1a3c2e; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: #a3c4a8; margin: 5px 0 0; }
    .body { padding: 30px; }
    .order-id { background: #f5f0e8; padding: 15px; border-radius: 10px; text-align: center; margin-bottom: 20px; }
    .order-id h2 { color: #1a3c2e; margin: 0; font-size: 20px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th { background: #1a3c2e; color: white; padding: 10px; text-align: left; }
    .items-table td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
    .total { background: #1a3c2e; color: white; padding: 15px; border-radius: 10px; text-align: right; margin-top: 20px; }
    .total h3 { margin: 0; font-size: 20px; }
    .footer { background: #f5f0e8; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .btn { display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 myMart</h1>
      <p>Your order has been placed successfully!</p>
    </div>
    <div class="body">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for shopping with myMart! Your order has been received and is being processed.</p>
      
      <div class="order-id">
        <h2>Order #${order.id?.toString().slice(-8).toUpperCase()}</h2>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items?.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total">
        <h3>Total: ₹${order.total_amount}</h3>
      </div>

      <p style="margin-top: 20px;">We'll notify you when your order is out for delivery!</p>
      <a href="${process.env.FRONTEND_URL}/my-orders" class="btn">Track Your Order</a>
    </div>
    <div class="footer">
      <p>© 2026 myMart. All rights reserved.</p>
      <p>123 Fresh Market Way, Grocery City</p>
    </div>
  </div>
</body>
</html>
`

export const welcomeEmailTemplate = (user) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: #1a3c2e; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 30px; }
    .features { display: flex; gap: 15px; margin: 20px 0; }
    .feature { flex: 1; background: #f5f0e8; padding: 15px; border-radius: 10px; text-align: center; }
    .btn { display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background: #f5f0e8; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 Welcome to myMart!</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${user.name}</strong>! 👋</p>
      <p>Welcome to myMart — your one-stop shop for fresh groceries delivered to your doorstep!</p>
      
      <div class="features">
        <div class="feature">🚀<br/><strong>Fast Delivery</strong><br/>Same day delivery</div>
        <div class="feature">🌿<br/><strong>100% Organic</strong><br/>Fresh produce</div>
        <div class="feature">🔒<br/><strong>Secure Pay</strong><br/>Safe checkout</div>
      </div>

      <p>Start shopping now and get <strong>free delivery</strong> on your first order above ₹500!</p>
      <a href="${process.env.FRONTEND_URL}" class="btn">Start Shopping →</a>
    </div>
    <div class="footer">
      <p>© 2026 myMart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

export const outForDeliveryTemplate = (order, user) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: #f97316; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 30px; }
    .otp-box { background: #1a3c2e; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .otp-box h2 { margin: 0; font-size: 36px; letter-spacing: 10px; }
    .footer { background: #f5f0e8; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚴 Your Order is Out for Delivery!</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Great news! Your order <strong>#${order.id?.toString().slice(-8).toUpperCase()}</strong> is on its way!</p>
      <p>Share this OTP with your delivery partner:</p>
      
      <div class="otp-box">
        <p style="margin: 0; color: #a3c4a8;">Delivery OTP</p>
        <h2>${order.otp}</h2>
      </div>

      <p>Your delivery partner: <strong>${order.delivery_partner_name || 'Assigned Partner'}</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 myMart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

export const lowStockAlertTemplate = (product) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: #dc2626; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 30px; }
    .alert-box { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .btn { display: inline-block; background: #1a3c2e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background: #f5f0e8; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Low Stock Alert!</h1>
    </div>
    <div class="body">
      <p>Hi Admin,</p>
      <p>The following product is running low on stock:</p>
      
      <div class="alert-box">
        <h2>${product.emoji} ${product.name}</h2>
        <p style="color: #dc2626; font-size: 24px; font-weight: bold; margin: 10px 0;">
          Only ${product.stock} left!
        </p>
        <p>Category: ${product.category}</p>
      </div>

      <p>Please restock immediately to avoid order failures.</p>
      <a href="${process.env.FRONTEND_URL}/admin/products" class="btn">Manage Products →</a>
    </div>
    <div class="footer">
      <p>© 2026 myMart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

export const flashDealsTemplate = (deals) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: #1a3c2e; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: #f97316; font-size: 18px; font-weight: bold; margin: 10px 0 0; }
    .body { padding: 30px; }
    .deal-card { border: 1px solid #f0f0f0; border-radius: 10px; padding: 15px; margin: 10px 0; display: flex; justify-content: space-between; align-items: center; }
    .deal-price { text-align: right; }
    .original { text-decoration: line-through; color: #999; font-size: 14px; }
    .sale { color: #f97316; font-size: 20px; font-weight: bold; }
    .badge { background: #f97316; color: white; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .btn { display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background: #f5f0e8; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 myMart</h1>
      <p>⚡ Flash Deals — Today Only!</p>
    </div>
    <div class="body">
      <p>Don't miss out on today's amazing deals!</p>
      
      ${deals?.map(deal => `
        <div class="deal-card">
          <div>
            <span style="font-size: 24px;">${deal.emoji}</span>
            <strong style="display: block;">${deal.name}</strong>
            <span class="badge">${deal.discount_percent}% OFF</span>
          </div>
          <div class="deal-price">
            <div class="original">₹${deal.original_price}</div>
            <div class="sale">₹${deal.price}</div>
          </div>
        </div>
      `).join('')}

      <center>
        <a href="${process.env.FRONTEND_URL}/deals" class="btn">Shop All Deals →</a>
      </center>
    </div>
    <div class="footer">
      <p>© 2026 myMart. All rights reserved.</p>
      <p>You received this because you are a myMart member.</p>
    </div>
  </div>
</body>
</html>
`
