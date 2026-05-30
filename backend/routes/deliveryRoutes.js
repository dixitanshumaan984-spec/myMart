import express from 'express';
import {
  addDeliveryPartner,
  getAllPartners,
  deliveryLogin,
  updateDeliveryStatus,
  togglePartnerAvailability,
  deletePartner,
  getMyDeliveries
} from '../controllers/deliveryController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Admin Routes
router.post('/', authMiddleware, roleMiddleware('admin'), addDeliveryPartner);
router.post('/register', authMiddleware, roleMiddleware('admin'), addDeliveryPartner);
router.get('/', authMiddleware, roleMiddleware('admin'), getAllPartners);
router.get('/partners', authMiddleware, roleMiddleware('admin'), getAllPartners);
router.put('/partners/:id/toggle', authMiddleware, roleMiddleware('admin'), togglePartnerAvailability);
router.delete('/partners/:id', authMiddleware, roleMiddleware('admin'), deletePartner);

// Delivery Partner Auth
router.post('/login', deliveryLogin);

// Delivery Partner Actions
router.get('/my-orders', authMiddleware, getMyDeliveries);
router.get('/my-deliveries', authMiddleware, getMyDeliveries);
router.put('/orders/:id', authMiddleware, updateDeliveryStatus);

export default router;