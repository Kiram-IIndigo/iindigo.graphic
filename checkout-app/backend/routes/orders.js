/**
 * routes/orders.js
 */

const express = require('express');
const { createOrder, getMyOrders, getOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
