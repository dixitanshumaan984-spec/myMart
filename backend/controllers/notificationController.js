import pool from '../config/db.js'
import { inngest } from '../inngest/client.js'

// Send flash deals to all users
export const sendFlashDeals = async (req, res) => {
  try {
    const { deals } = req.body

    // Get all users from database
    const usersResult = await pool.query(
      'SELECT id, name, email FROM users'
    )
    const users = usersResult.rows

    if (users.length === 0) {
      return res.status(400).json({ message: 'No users found!' })
    }

    // Trigger Inngest event
    await inngest.send({
      name: 'admin/flash-deals',
      data: { deals, users }
    })

    res.json({
      message: `Flash deals sent to ${users.length} users!`,
      count: users.length
    })
  } catch (error) {
    console.error('Flash deals error:', error)
    res.status(500).json({ message: 'Failed to send flash deals' })
  }
}
