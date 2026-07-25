/* =====================================================
   ORGANIC ILAJ — BACKEND SERVER
   Express API + static file server.

   Provides:
   - GET  /api/products               -> product catalog (read-only)
   - GET  /api/products/:slug         -> single product
   - POST /api/contact                -> save a contact form message
   - POST /api/orders                 -> place an order from the cart
   - POST /api/admin/login            -> admin login (password from .env)
   - GET  /api/admin/orders           -> list all orders   (admin only)
   - GET  /api/admin/messages         -> list all messages (admin only)
   - PATCH /api/admin/orders/:id      -> update order status (admin only)

   Data is stored as simple JSON files in /data — no database
   installation required. Good enough for a small business site;
   swap out the storage.js functions later if you outgrow it.
===================================================== */

'use strict';

require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const store = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';

app.use(cors());
app.use(express.json());

// ----- Basic request logging (helpful while developing) -----
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ----- Rate limiting for form-submission endpoints (anti-spam) -----
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' }
});

/* =====================================================
   ADMIN AUTH (very lightweight — single-user, in-memory tokens)
===================================================== */
const validTokens = new Set();

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token && validTokens.has(token)) return next();
  return res.status(401).json({ success: false, error: 'Not authenticated.' });
}

app.post('/api/admin/login', formLimiter, (req, res) => {
  const { password } = req.body || {};
  if (password && password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(24).toString('hex');
    validTokens.add(token);
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, error: 'Incorrect password.' });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = (req.headers.authorization || '').slice(7);
  validTokens.delete(token);
  res.json({ success: true });
});

/* =====================================================
   PRODUCTS (read-only, used for order price validation
   + can be fetched by the frontend/admin if needed)
===================================================== */
app.get('/api/products', (req, res) => {
  res.json({ success: true, products: store.getProducts() });
});

app.get('/api/products/:slug', (req, res) => {
  const product = store.getProducts().find(p => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found.' });
  res.json({ success: true, product });
});

/* =====================================================
   CONTACT FORM
===================================================== */
app.post('/api/contact', formLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  if (!emailOk) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  const entry = {
    id: 'MSG-' + Date.now().toString(36).toUpperCase(),
    name: name.trim(),
    email: email.trim(),
    subject: (subject || '').trim() || '(No subject)',
    message: message.trim(),
    status: 'new',
    createdAt: new Date().toISOString()
  };

  try {
    await store.addMessage(entry);
    res.json({ success: true, message: 'Thank you! Your message has been received. We will get back to you soon.', id: entry.id });
  } catch (err) {
    console.error('Failed to save message:', err);
    res.status(500).json({ success: false, error: 'Could not save your message right now. Please try again shortly.' });
  }
});

/* =====================================================
   ORDERS (created from the cart at checkout)
===================================================== */
app.post('/api/orders', formLimiter, async (req, res) => {
  const { customer, payment, items } = req.body || {};

  if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address || !customer.city) {
    return res.status(400).json({ success: false, error: 'Please fill in all required customer & address fields.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Your cart is empty.' });
  }

  const catalog = store.getProducts();
  const lineItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = catalog.find(p => p.slug === item.slug);
    if (!product) {
      return res.status(400).json({ success: false, error: `Unknown product in cart: ${item.slug}` });
    }
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    // Price is always taken from the server-side catalog, never trusted from the client.
    const lineTotal = product.price * qty;
    subtotal += lineTotal;
    lineItems.push({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      qty,
      lineTotal
    });
  }

  const shipping = 0; // Free delivery all over Pakistan, per the site's promise
  const total = subtotal + shipping;

  const order = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase(),
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      postalCode: (customer.postalCode || '').trim()
    },
    payment: payment === 'card' ? 'Card / Online Payment' : 'Cash on Delivery',
    items: lineItems,
    subtotal,
    shipping,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    await store.addOrder(order);
    res.json({ success: true, order });
  } catch (err) {
    console.error('Failed to save order:', err);
    res.status(500).json({ success: false, error: 'Could not place your order right now. Please try again shortly.' });
  }
});

/* =====================================================
   ADMIN — view & manage orders and messages
===================================================== */
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = (await store.getOrders()).slice().reverse();
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Failed to load orders:', err);
    res.status(500).json({ success: false, error: 'Could not load orders.' });
  }
});

app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status.' });
  }
  try {
    const updated = await store.updateOrderStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ success: false, error: 'Order not found.' });
    res.json({ success: true, order: updated });
  } catch (err) {
    console.error('Failed to update order:', err);
    res.status(500).json({ success: false, error: 'Could not update order.' });
  }
});

app.get('/api/admin/messages', requireAdmin, async (req, res) => {
  try {
    const messages = (await store.getMessages()).slice().reverse();
    res.json({ success: true, messages });
  } catch (err) {
    console.error('Failed to load messages:', err);
    res.status(500).json({ success: false, error: 'Could not load messages.' });
  }
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  let orders, messages;
  try {
    orders = await store.getOrders();
    messages = await store.getMessages();
  } catch (err) {
    console.error('Failed to load stats data:', err);
    return res.status(500).json({ success: false, error: 'Could not load stats.' });
  }

  const activeOrders = orders.filter(o => o.status !== 'cancelled');

  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalMessages = messages.length;
  const newMessages = messages.filter(m => m.status === 'new').length;

  const statusCounts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  orders.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

  // ----- Payment method breakdown -----
  const paymentBreakdown = {};
  activeOrders.forEach(o => {
    const key = o.payment || 'Unknown';
    if (!paymentBreakdown[key]) paymentBreakdown[key] = { count: 0, revenue: 0 };
    paymentBreakdown[key].count++;
    paymentBreakdown[key].revenue += o.total;
  });

  // ----- Revenue by day (last 14 days) -----
  const days = [];
  const dayMap = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = 0;
    days.push(key);
  }
  activeOrders.forEach(o => {
    const key = (o.createdAt || '').slice(0, 10);
    if (dayMap[key] !== undefined) dayMap[key] += o.total;
  });
  const revenueByDay = days.map(day => ({ day, revenue: dayMap[day] }));

  // ----- Top products by units sold -----
  const productTotals = {};
  activeOrders.forEach(o => {
    o.items.forEach(item => {
      if (!productTotals[item.slug]) {
        productTotals[item.slug] = { name: item.name, qty: 0, revenue: 0 };
      }
      productTotals[item.slug].qty += item.qty;
      productTotals[item.slug].revenue += item.lineTotal;
    });
  });
  const topProducts = Object.values(productTotals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ----- Today / this week revenue -----
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRevenue = dayMap[todayKey] || 0;
  const weekRevenue = revenueByDay.slice(-7).reduce((s, d) => s + d.revenue, 0);

  const avgOrderValue = activeOrders.length ? Math.round(totalRevenue / activeOrders.length) : 0;

  res.json({
    success: true,
    stats: {
      totalRevenue,
      todayRevenue,
      weekRevenue,
      avgOrderValue,
      totalOrders,
      totalMessages,
      newMessages,
      statusCounts,
      paymentBreakdown,
      revenueByDay,
      topProducts
    }
  });
});

app.patch('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  const allowed = ['new', 'read', 'replied'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status.' });
  }
  try {
    const updated = await store.updateMessageStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ success: false, error: 'Message not found.' });
    res.json({ success: true, message: updated });
  } catch (err) {
    console.error('Failed to update message:', err);
    res.status(500).json({ success: false, error: 'Could not update message.' });
  }
});

/* =====================================================
   STATIC SITE (only when running as a normal Node process,
   e.g. locally or on a VPS. On Vercel, static files are
   served directly by Vercel — not through this function.)
===================================================== */
if (!process.env.VERCEL) {
  const SITE_ROOT = path.join(__dirname, '..');
  app.use(express.static(SITE_ROOT));

  // Any unknown non-API route -> let the static server's 404 handle it,
  // but be nice about missing HTML pages.
  app.use((req, res) => {
    res.status(404).send('404 — Page not found.');
  });
}

// On Vercel this file is imported by api/index.js as a serverless
// function, so we must NOT call app.listen() there (Vercel manages
// the HTTP server itself). Only listen when run directly, e.g.
// `node server.js` locally or on a VPS/pm2.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🌿 Organic Ilaj server running at http://localhost:${PORT}`);
    console.log(`   Admin panel: http://localhost:${PORT}/admin.html\n`);
  });
}

module.exports = app;
