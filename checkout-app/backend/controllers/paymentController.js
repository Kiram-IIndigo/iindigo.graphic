/**
 * controllers/paymentController.js
 * Creates Stripe PaymentIntents and handles webhooks
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');
const Order = require('../models/Order');

// ─── POST /api/payments/create-intent ────────────────────
// Creates a PaymentIntent with server-verified totals
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items provided.' });
    }

    // Calculate total server-side — NEVER trust client
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      subtotal += product.price * item.quantity;
    }

    const shippingCost = subtotal >= 50 ? 0 : 5.99;
    const tax = parseFloat((subtotal * 0.1).toFixed(2));
    const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

    // Stripe amounts are in cents (integer)
    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: req.user._id.toString(),
        itemCount: items.length,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      breakdown: { subtotal, shippingCost, tax, total },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/payments/webhook ───────────────────────────
// Stripe sends events here (payment_intent.succeeded, etc.)
// Raw body required — registered before express.json() in server.js
exports.handleWebhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('✅ PaymentIntent succeeded:', event.data.object.id);
      break;
    case 'payment_intent.payment_failed':
      console.log('❌ PaymentIntent failed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled webhook event: ${event.type}`);
  }

  res.json({ received: true });
};
