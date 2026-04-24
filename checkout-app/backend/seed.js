/**
 * seed.js — Populates the database with sample products
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'Void Circle Tee',
    description: 'A meditation on emptiness and form. Premium 100% ring-spun cotton, 180gsm. The circular composition makes this a true conversation piece.',
    price: 29.99,
    category: 'clothing',
    stock: 50,
    rating: 4.8,
    numReviews: 24,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
  },
  {
    name: 'Static Noise Hoodie',
    description: 'Inspired by the chaos between TV channels. Heavy 380gsm fleece with ribbed cuffs. Unisex oversized fit.',
    price: 59.99,
    category: 'clothing',
    stock: 30,
    rating: 4.9,
    numReviews: 18,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80',
  },
  {
    name: 'Grid Ghost Tee',
    description: 'Barely there. Soft-washed 100% cotton for broken-in comfort from day one. The invisible scaffolding of design made visible.',
    price: 26.99,
    category: 'clothing',
    stock: 75,
    rating: 4.6,
    numReviews: 31,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80',
  },
  {
    name: 'Orbital Cap',
    description: 'Structured 6-panel cap with embroidered orbital design. Adjustable strap, one size fits all.',
    price: 24.99,
    category: 'accessories',
    stock: 40,
    rating: 4.7,
    numReviews: 12,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80',
  },
  {
    name: 'Signal Lost Crewneck',
    description: 'Glow-reactive screen-printed text on heavy 320gsm French terry. "SIGNAL LOST" rendered as corrupted data. Boxy oversized fit.',
    price: 54.99,
    category: 'clothing',
    stock: 20,
    rating: 4.9,
    numReviews: 9,
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&q=80',
  },
  {
    name: 'Indigo Slides',
    description: 'Soft EVA foam slides with textured footbed. Ultra-lightweight for all-day comfort. Available in sizes 38–46.',
    price: 39.99,
    category: 'footwear',
    stock: 35,
    rating: 4.5,
    numReviews: 22,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
  },
  {
    name: 'Fracture Tote',
    description: 'Heavy-duty cotton canvas tote with screen-printed fracture design. 40L capacity. Reinforced handles.',
    price: 19.99,
    category: 'accessories',
    stock: 60,
    rating: 4.4,
    numReviews: 15,
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&q=80',
  },
  {
    name: 'Soft Chaos Joggers',
    description: 'Heavyweight 380gsm fleece joggers with drop-crotch and tapered leg. Side seam pockets. Organic cotton blend.',
    price: 64.99,
    category: 'clothing',
    stock: 25,
    rating: 4.8,
    numReviews: 7,
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&q=80',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    const created = await Product.insertMany(products);
    console.log(`🌱 Seeded ${created.length} products`);

    console.log('\nProduct IDs (useful for testing):');
    created.forEach((p) => console.log(`  ${p._id}  ${p.name}  $${p.price}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
