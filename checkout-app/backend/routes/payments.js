/**
 * routes/payments.js
 */

const express = require('express');
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Webhook uses raw body — registered in server.js BEFORE express.json()
router.post('/webhook', handleWebhook);

// Payment intent requires auth
router.post('/create-intent', protect, createPaymentIntent);

module.exports = router;
