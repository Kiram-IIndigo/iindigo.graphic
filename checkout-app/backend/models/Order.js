/**
 * models/Order.js
 * Order schema — created after successful Stripe payment
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },  // snapshot at time of purchase
  price: { type: Number, required: true }, // snapshot at time of purchase
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],

    // ─── Addresses ────────────────────────────────────────
    billingAddress: {
      fullName: { type: String, required: true },
      email:    { type: String, required: true },
      phone:    { type: String },
      address:  { type: String, required: true },
      city:     { type: String, required: true },
      postalCode: { type: String, required: true },
      country:  { type: String, required: true },
    },
    shippingAddress: {
      fullName:   { type: String, required: true },
      address:    { type: String, required: true },
      city:       { type: String, required: true },
      postalCode: { type: String, required: true },
      country:    { type: String, required: true },
    },

    // ─── Pricing ──────────────────────────────────────────
    subtotal:     { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    tax:          { type: Number, required: true, default: 0 },
    total:        { type: Number, required: true },

    // ─── Payment ──────────────────────────────────────────
    stripePaymentIntentId: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    // ─── Fulfillment ──────────────────────────────────────
    orderStatus: {
      type: String,
      enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
