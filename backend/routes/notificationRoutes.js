import express from 'express'
import { sendFlashDeals } from '../controllers/notificationController.js'

const router = express.Router()

router.post('/flash-deals', sendFlashDeals)

export default router