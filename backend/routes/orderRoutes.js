import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  assignDeliveryPartner,
  getOrderById,
  verifyOTP
} from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, placeOrder);
router.get('/my', authMiddleware, getMyOrders);
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), getAllOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, roleMiddleware('admin'), updateOrderStatus);
router.put('/:id/assign', authMiddleware, roleMiddleware('admin'), assignDeliveryPartner);
router.post('/:id/verify-otp', authMiddleware, verifyOTP);

export default router;