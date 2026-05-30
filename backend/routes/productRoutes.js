import express from 'express';
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct, getDeals } from '../controllers/productController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/deals', getDeals); 
router.get('/:id', getProductById);
router.post('/', authMiddleware, roleMiddleware('admin'), addProduct);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteProduct);

export default router;