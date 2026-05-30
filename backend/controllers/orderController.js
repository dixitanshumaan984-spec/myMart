import pool from '../config/db.js';
import { getIO } from '../config/socket.js';
import { inngest } from '../inngest/client.js';

// Place Order
export const placeOrder = async (req, res) => {
  const { address_id, items, total_amount, payment_method } = req.body;
  const user_id = req.user.id;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const order = await pool.query(
      `INSERT INTO orders (user_id, address_id, total_amount, payment_method, delivery_otp) 
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user_id, address_id, total_amount, payment_method || 'cod', otp]
    );
    const order_id = order.rows[0].id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)`,
        [order_id, item.product_id, item.quantity, item.price]
      );
    }

    const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [user_id]);
    const customer = userResult.rows[0];

    const orderItems = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.emoji
       FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order_id]
    );

    // ✅ Send order confirmation email
    await inngest.send({
      name: 'order/placed',
      data: {
        orderId: order_id,
        customerName: customer.name,
        customerEmail: customer.email,
        items: orderItems.rows,
        totalAmount: total_amount,
        paymentMethod: payment_method || 'cod',
        otp: otp,
      }
    });

    res.status(201).json(order.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, COUNT(oi.id) AS item_count,
        STRING_AGG(p.name || ' x' || oi.quantity, ', ') AS items_summary
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email,
        COUNT(oi.id) AS item_count,
        STRING_AGG(p.name || ' x' || oi.quantity, ', ') AS items_summary
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    const order = result.rows[0];

    const userResult = await pool.query(
      'SELECT u.name, u.email FROM users u WHERE u.id = $1',
      [order.user_id]
    );
    const customer = userResult.rows[0];

    if (status === 'out_for_delivery' && customer) {
      await inngest.send({
        name: 'order/out-for-delivery',
        data: {
          orderId: order.id,
          customerName: customer.name,
          customerEmail: customer.email,
          otp: order.delivery_otp,
        }
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign Delivery Partner (Admin)
export const assignDeliveryPartner = async (req, res) => {
  const { delivery_partner_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET delivery_partner_id=$1, status=$2 WHERE id=$3 RETURNING *',
      [delivery_partner_id, 'assigned', req.params.id]
    );

    // ✅ Mark partner as unavailable
    await pool.query(
      'UPDATE delivery_partners SET is_available = false WHERE id = $1',
      [delivery_partner_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Order Detail
export const getOrderById = async (req, res) => {
  try {
    const order = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email,
        a.full_name, a.phone, a.street, a.city, a.state, a.pincode,
        dp.name AS delivery_partner_name, dp.phone AS delivery_partner_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.address_id = a.id
       LEFT JOIN delivery_partners dp ON o.delivery_partner_id = dp.id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (order.rows.length === 0)
      return res.status(404).json({ message: 'Order not found' });

    const items = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.emoji, p.image_url
       FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );
    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify OTP (Delivery Partner)
export const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Order not found' });

    const order = result.rows[0];

    if (order.otp_verified)
      return res.status(400).json({ message: 'OTP already used' });

    if (order.delivery_otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    // ✅ Mark order as delivered
    await pool.query(
      'UPDATE orders SET status=$1, otp_verified=$2 WHERE id=$3',
      ['delivered', true, req.params.id]
    );

    // ✅ Mark delivery partner as available again
    if (order.delivery_partner_id) {
      await pool.query(
        'UPDATE delivery_partners SET is_available = true WHERE id = $1',
        [order.delivery_partner_id]
      );
      console.log(`✅ Partner ${order.delivery_partner_id} is available again`)
    }

    // ✅ Emit realtime update
    getIO().to(`order_${req.params.id}`).emit('status_changed', {
      orderId: req.params.id,
      status: 'delivered',
    });

    res.json({ message: 'OTP verified! Order marked as delivered. ✅' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};