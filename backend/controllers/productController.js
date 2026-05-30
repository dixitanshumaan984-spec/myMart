import pool from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addProduct = async (req, res) => {
  const { name, description, price, category, emoji, image_url, original_price, discount_percent, stock, is_deal } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products 
        (name, description, price, category, emoji, image_url, original_price, discount_percent, stock, is_deal) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, description, price, category, emoji || '🛒', image_url || null, original_price, discount_percent, stock, is_deal || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const { name, description, price, category, emoji, image_url, original_price, discount_percent, stock, is_deal } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET 
        name=$1, description=$2, price=$3, category=$4, 
        emoji=$5, image_url=$6, original_price=$7, discount_percent=$8, stock=$9, is_deal=$10
       WHERE id=$11 RETURNING *`,
      [name, description, price, category, emoji || '🛒', image_url || null, original_price, discount_percent, stock, is_deal || false, req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDeals = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE is_deal = TRUE ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};