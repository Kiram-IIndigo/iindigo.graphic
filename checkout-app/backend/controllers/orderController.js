/**
 * controllers/orderController.js
 * Create orders (after Stripe payment) and retrieve order history
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ─── POST /api/orders ─────────────────────────────────────
// Called by frontend after Stripe confirms payment
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      billingAddress,
      shippingAddress,
      stripePaymentIntentId,
    } = req.body;

    // 1. Verify payment intent actually succeeded with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not confirmed. Order not created.',
      });
    }

    // 2. Validate items and calculate totals server-side (never trust client prices)
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found.`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}".`,
        });
      }

      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });
    }

    const shippingCost = subtotal >= 50 ? 0 : 5.99; // free shipping over $50
    const tax = parseFloat((subtotal * 0.1).toFixed(2)); // 10% tax
    const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

    // 3. Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      billingAddress,
      shippingAddress,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shippingCost,
      tax,
      total,
      stripePaymentIntentId,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
    });

    // 4. Decrement stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    // Handle duplicate payment intent (idempotency)
    if (err.code === 11000) {
      const existing = await Order.findOne({ stripePaymentIntentId: req.body.stripePaymentIntentId });
      return res.json({ success: true, order: existing });
    }
    next(err);
  }
};

// ─── GET /api/orders ──────────────────────────────────────
// Returns all orders for the logged-in user
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.product', 'name image');

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    // Only allow owner to view their order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
