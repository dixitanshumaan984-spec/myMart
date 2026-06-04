import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { serve } from 'inngest/express'
import { inngest } from './inngest/client.js'
import {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendOutForDelivery,
  sendLowStockAlert,
  sendFlashDeals,
  autoAssignDelivery
} from './inngest/functions.js'
import { setIO } from './config/socket.js'
import './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import addressRoutes from './routes/addressRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import deliveryRoutes from './routes/deliveryRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js' // ✅ Added

const app = express()
const httpServer = createServer(app)

// ✅ CORS for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://my-mart-one.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json())

// ✅ Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

setIO(io)

// ✅ Inngest route
app.use('/api/inngest', serve({
  client: inngest,
  functions: [
    sendWelcomeEmail,
    sendOrderConfirmation,
    sendOutForDelivery,
    sendLowStockAlert,
    sendFlashDeals,
    autoAssignDelivery
  ]
}))

// ✅ All routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/delivery', deliveryRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/upload', uploadRoutes) // ✅ Added

// ✅ Test route
app.get('/', (req, res) => {
  res.json({ message: 'myMart API is running! 🛒' })
})

// ✅ Socket.IO events
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)

  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`)
    console.log(`📦 Socket joined order room: order_${orderId}`)
  })

  socket.on('share_location', ({ orderId, lat, lng }) => {
    io.to(`order_${orderId}`).emit('location_update', { lat, lng, orderId })
  })

  socket.on('order_status_update', ({ orderId, status }) => {
    io.to(`order_${orderId}`).emit('status_changed', { orderId, status })
  })

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})