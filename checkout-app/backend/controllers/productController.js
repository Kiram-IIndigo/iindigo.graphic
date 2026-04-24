/**
 * controllers/productController.js
 * CRUD operations for products (read-only for public)
 */

const Product = require('../models/Product');

// ─── GET /api/products ────────────────────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, sort = '-createdAt' } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).sort(sort);
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/products/:id ────────────────────────────────
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};
