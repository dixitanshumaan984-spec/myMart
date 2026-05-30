import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Add / Register Delivery Partner (Admin)
export const addDeliveryPartner = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const exists = await pool.query(
      'SELECT * FROM delivery_partners WHERE email=$1', [email]
    );
    if (exists.rows.length > 0)
      return res.status(400).json({ message: 'Partner already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO delivery_partners (name, email, password, phone) VALUES ($1,$2,$3,$4) RETURNING id, name, email, phone, is_available',
      [name, email, hashed, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Partners (Admin)
export const getAllPartners = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        dp.id, dp.name, dp.email, dp.phone, dp.is_available,
        COUNT(o.id) AS total_deliveries
       FROM delivery_partners dp
       LEFT JOIN orders o ON dp.id = o.delivery_partner_id 
         AND o.status = 'delivered'
       GROUP BY dp.id
       ORDER BY dp.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delivery Partner Login
export const deliveryLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM delivery_partners WHERE email=$1', [email]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Invalid credentials' });

    const partner = result.rows[0];
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: partner.id, role: 'delivery' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Order Status (Delivery Partner)
export const updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle Partner Availability (Admin)
export const togglePartnerAvailability = async (req, res) => {
  const { is_available } = req.body;
  try {
    const result = await pool.query(
      'UPDATE delivery_partners SET is_available=$1 WHERE id=$2 RETURNING id, name, email, phone, is_available',
      [is_available, req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Partner not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Partner (Admin)
export const deletePartner = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM delivery_partners WHERE id=$1', [req.params.id]
    );
    res.json({ message: 'Partner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Assigned Orders for Delivery Partner
export const getMyDeliveries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        o.*,
        u.name AS customer_name,
        u.email AS customer_email,
        a.full_name, a.phone, a.street, a.city, a.state, a.pincode
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.delivery_partner_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};