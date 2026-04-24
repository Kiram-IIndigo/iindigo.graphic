# ShopKit — Full-Stack E-Commerce Checkout System

**React + Node.js + MongoDB + Stripe** — Complete, production-ready checkout with auth, cart, Stripe payments, and order history.

---

## 📁 Full Project Structure

```
checkout-app/
├── README.md
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js                    ← Express app entry point
│   ├── seed.js                      ← Run once to populate products
│   ├── controllers/
│   │   ├── authController.js        ← register, login, getMe
│   │   ├── productController.js     ← getProducts, getProduct
│   │   ├── orderController.js       ← createOrder, getMyOrders, getOrder
│   │   └── paymentController.js     ← createPaymentIntent, handleWebhook
│   ├── middleware/
│   │   └── auth.js                  ← JWT verification middleware
│   ├── models/
│   │   ├── User.js                  ← bcrypt hashed passwords
│   │   ├── Product.js               ← product catalog
│   │   └── Order.js                 ← full order snapshot
│   └── routes/
│       ├── auth.js                  ← /api/auth/*
│       ├── products.js              ← /api/products/*
│       ├── orders.js                ← /api/orders/* (protected)
│       └── payments.js              ← /api/payments/*
│
└── frontend/
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx                  ← All routes defined here
        ├── index.js                 ← React entry point
        ├── components/
        │   ├── common/
        │   │   └── ProtectedRoute.jsx
        │   └── layout/
        │       └── Navbar.jsx
        ├── context/
        │   ├── AuthContext.jsx      ← Auth state, login/register/logout
        │   └── CartContext.jsx      ← Cart state (localStorage-persisted)
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── ProductsPage.jsx     ← Grid + category filters
        │   ├── CartPage.jsx         ← Qty controls + order summary
        │   ├── CheckoutPage.jsx     ← 3-step: billing → shipping → Stripe
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── OrdersPage.jsx       ← Full order history
        │   └── OrderDetailPage.jsx  ← Single order + success banner
        ├── utils/
        │   └── api.js               ← Axios with auto JWT headers
        └── styles/
            └── index.css            ← Tailwind + reusable components
```

---

## ✅ Step 1 — Install Prerequisites

### Node.js (required)
Download **LTS version** from https://nodejs.org  
After install, verify in a terminal:
```
node --version    # should be v18.x or higher
npm --version     # should be 9.x or higher
```

### MongoDB (local database)
Download Community Edition from https://www.mongodb.com/try/download/community

- **Windows**: Run the `.msi` installer → check "Install MongoDB as a Service" → it starts automatically
- **Mac**: `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
- **Linux**: `sudo apt-get install -y mongodb && sudo systemctl start mongod`

Test it works:
```
mongosh
# You should see a > prompt. Type exit to quit.
```

### Stripe Account (free)
1. Sign up at https://stripe.com (free, no real money needed in test mode)
2. Go to https://dashboard.stripe.com/test/apikeys
3. You need **two** keys:
   - **Publishable key** → starts with `pk_test_` → goes in **frontend** `.env`
   - **Secret key** → starts with `sk_test_` → goes in **backend** `.env`

### Stripe CLI (for webhook testing)
- **Mac**: `brew install stripe/stripe-cli/stripe`
- **Windows/Linux**: Download from https://github.com/stripe/stripe-cli/releases → extract → add to PATH

Test: `stripe --version` should print a version number.

---

## 🚀 Step 2 — Set Up the Backend

Open a terminal in the `checkout-app/backend` folder:

```bash
cd checkout-app/backend
npm install
```

Create your `.env` file (copy the example):
```bash
# Mac/Linux:
cp .env.example .env

# Windows CMD:
copy .env.example .env
```

Open `.env` and fill in your values:
```env
MONGO_URI=mongodb://localhost:27017/checkout_app
JWT_SECRET=make_up_any_long_random_string_at_least_32_characters
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_FROM_STRIPE_DASHBOARD
STRIPE_WEBHOOK_SECRET=whsec_placeholder_update_in_step_4
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Seed the database with 8 sample products (run once):
```bash
npm run seed
```
Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing products
🌱 Seeded 8 products
```

Start the backend:
```bash
npm run dev
```
Expected output:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

**Quick test** — open a new terminal and run:
```bash
curl http://localhost:5000/api/health
# → {"status":"ok","time":"..."}

curl http://localhost:5000/api/products
# → {"success":true,"count":8,"products":[...]}
```

---

## 🎨 Step 3 — Set Up the Frontend

Open a **new terminal** (keep backend running) in `checkout-app/frontend`:

```bash
cd checkout-app/frontend
npm install
```

Create the `.env` file:
```bash
# Mac/Linux:
cp .env.example .env

# Windows CMD:
copy .env.example .env
```

Open `.env` and add your Stripe publishable key:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

Start the frontend:
```bash
npm start
```

React will open **http://localhost:3000** automatically.

---

## 💳 Step 4 — Set Up Stripe Webhooks

Open a **third terminal** and log in to Stripe CLI:
```bash
stripe login
# Opens browser → click "Allow access"
```

Start the webhook forwarder:
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

You'll see a line like:
```
> Ready! Your webhook signing secret is whsec_abc123...
```

Copy that `whsec_...` value into `backend/.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

Restart the backend (Ctrl+C then `npm run dev` again).

---

## 🧪 Step 5 — Test Everything

You now need **3 terminals running simultaneously**:
- Terminal 1: `backend/` → `npm run dev`
- Terminal 2: `frontend/` → `npm start`
- Terminal 3: `stripe listen --forward-to localhost:5000/api/payments/webhook`

### Test 1: Products Page
1. Open http://localhost:3000/products
2. You should see 8 product cards
3. Click the category filter buttons
4. Click **+ Add** on any product → toast notification appears
5. Navbar cart count increases

### Test 2: Shopping Cart
1. Add 2–3 items to cart
2. Go to http://localhost:3000/cart
3. Use **+/−** buttons to change quantities
4. Click the **trash icon** to remove an item
5. Add items totaling over **$50** → shipping becomes FREE

### Test 3: Register
1. Go to http://localhost:3000/register
2. Fill in: Name, Email, Password (min 6 chars), Confirm Password
3. On success: auto-redirected, navbar shows your name

### Test 4: Login / Logout
1. Click **Logout** in the navbar
2. Go to http://localhost:3000/login
3. Log in with your credentials
4. Try wrong password → red error message

### Test 5: Protected Route
1. While **logged out**, go to http://localhost:3000/checkout
2. You should be redirected to `/login`
3. After logging in → redirected back to `/checkout`

### Test 6: Full Checkout (the main event!)

Make sure you're **logged in** with items in your cart, then go to `/checkout`.

**Step 1 — Billing Details:** Fill in all fields (name, email, address, city, postal code, country) → **Continue**

**Step 2 — Shipping Address:** Check "same as billing" or enter a different address → **Continue**

**Step 3 — Payment:** Use these Stripe test card numbers:

| Scenario | Card Number | Expiry | CVC |
|---|---|---|---|
| ✅ **Success** | `4242 4242 4242 4242` | `12/34` | `123` |
| ❌ Card declined | `4000 0000 0000 0002` | any future | any |
| 💸 Insufficient funds | `4000 0000 0000 9995` | any future | any |
| 🔐 Requires 3D Secure | `4000 0027 6000 3184` | any future | any |

Use `4242 4242 4242 4242` first. Click **Place Order**.

**Expected result:**
- Spinner while processing
- "Payment successful! 🎉" toast
- Redirected to order confirmation page with green success banner
- Order shows all items, addresses, and totals

### Test 7: Order History
1. Go to http://localhost:3000/orders
2. Your order appears with "Confirmed" status
3. Click the order → full detail view

### Test 8: API Directly (optional)

Using `curl` in a terminal:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"pass123"}'
```

**Login (save the token):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

**Get my orders (replace TOKEN with actual token):**
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN_HERE"
```

---

## 🔧 Troubleshooting

**"Cannot connect to MongoDB"**
- Windows: Open Services → find "MongoDB Server" → click Start
- Mac: `brew services restart mongodb-community`
- Linux: `sudo systemctl start mongod`

**npm install errors**
- Make sure Node.js is v18+: `node --version`
- Delete `node_modules` and `package-lock.json`, then `npm install` again

**Stripe card field not appearing**
- Check frontend `.env` has `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- The key must start with `pk_test_` (NOT `sk_test_`)
- Restart React dev server after changing `.env`

**"Could not initialize payment" error**
- Check backend `.env` has `STRIPE_SECRET_KEY=sk_test_...`
- Make sure the Stripe CLI webhook listener is running in terminal 3
- Check backend terminal for red error messages

**Port already in use**
```bash
# Mac/Linux — kill port 5000:
kill -9 $(lsof -ti:5000)

# Windows — find PID then kill:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Frontend shows blank white screen**
- Open browser DevTools (F12) → Console tab → read the error
- Most common cause: `.env` file missing or wrong Stripe key

---

## 📦 Running All Three Services

```bash
# Terminal 1 — Backend API
cd checkout-app/backend
npm run dev

# Terminal 2 — Frontend React App
cd checkout-app/frontend
npm start

# Terminal 3 — Stripe Webhook Listener
stripe listen --forward-to localhost:5000/api/payments/webhook
```

All three must be running for payments to work end-to-end.
