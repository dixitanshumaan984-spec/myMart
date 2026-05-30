import express from 'express';
import { addAddress, getMyAddresses, deleteAddress } from '../controllers/addressController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, addAddress);
router.get('/', authMiddleware, getMyAddresses);
router.delete('/:id', authMiddleware, deleteAddress);

export default router;