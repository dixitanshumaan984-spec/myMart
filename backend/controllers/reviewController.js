import pool from '../config/db.js';

export const addReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, product_id, rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id=$1 ORDER BY r.created_at DESC',
      [req.params.productId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};