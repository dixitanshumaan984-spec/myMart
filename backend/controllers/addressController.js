import pool from '../config/db.js';

export const addAddress = async (req, res) => {
  const { full_name, phone, street, city, state, pincode, is_default } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO addresses (user_id, full_name, phone, street, city, state, pincode, is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [req.user.id, full_name, phone, street, city, state, pincode, is_default || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyAddresses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM addresses WHERE user_id=$1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    await pool.query('DELETE FROM addresses WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};