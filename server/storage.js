/* =====================================================
   Storage layer.

   - Products: always read from the bundled JSON file — this is a
     static catalog (source of truth is js/products-data.js, synced
     in via `npm run sync-products`). No database needed for this.

   - Orders & Messages: if DATABASE_URL is set (see server/.env.example
     and server/neon-schema.sql), these are saved permanently in a
     Neon Postgres database. Otherwise, falls back to local JSON files
     under server/data — handy for quick local testing without setting
     up a database, but NOT durable on Vercel (its filesystem is
     read-only except /tmp, which is wiped on cold starts / redeploys).
===================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const BUNDLED_DATA_DIR = path.join(__dirname, 'data');
const BUNDLED_PRODUCTS_FILE = path.join(BUNDLED_DATA_DIR, 'products.json');

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

/* ---------------------------------------------------
   PRODUCTS — always file-based (static catalog)
--------------------------------------------------- */
function getProducts() {
  return readJSON(BUNDLED_PRODUCTS_FILE, []);
}

/* ---------------------------------------------------
   ORDERS + MESSAGES
--------------------------------------------------- */
const useDb = !!process.env.DATABASE_URL;

let ordersApi;
let messagesApi;

if (useDb) {
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);

  const rowToOrder = (row) => ({
    id: row.id,
    customer: row.customer,
    payment: row.payment,
    items: row.items,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined
  });

  const rowToMessage = (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at
  });

  ordersApi = {
    async getOrders() {
      const rows = await sql`SELECT * FROM orders ORDER BY created_at ASC`;
      return rows.map(rowToOrder);
    },
    async addOrder(order) {
      await sql`
        INSERT INTO orders (id, customer, payment, items, subtotal, shipping, total, status, created_at)
        VALUES (
          ${order.id},
          ${JSON.stringify(order.customer)}::jsonb,
          ${order.payment},
          ${JSON.stringify(order.items)}::jsonb,
          ${order.subtotal},
          ${order.shipping},
          ${order.total},
          ${order.status},
          ${order.createdAt}
        )
      `;
      return order;
    },
    async updateOrderStatus(id, status) {
      const rows = await sql`
        UPDATE orders SET status = ${status}, updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `;
      return rows[0] ? rowToOrder(rows[0]) : null;
    }
  };

  messagesApi = {
    async getMessages() {
      const rows = await sql`SELECT * FROM messages ORDER BY created_at ASC`;
      return rows.map(rowToMessage);
    },
    async addMessage(message) {
      await sql`
        INSERT INTO messages (id, name, email, subject, message, status, created_at)
        VALUES (
          ${message.id},
          ${message.name},
          ${message.email},
          ${message.subject},
          ${message.message},
          ${message.status},
          ${message.createdAt}
        )
      `;
      return message;
    },
    async updateMessageStatus(id, status) {
      const rows = await sql`
        UPDATE messages SET status = ${status}
        WHERE id = ${id}
        RETURNING *
      `;
      return rows[0] ? rowToMessage(rows[0]) : null;
    }
  };
} else {
  // ----- Local JSON-file fallback (dev only — not durable on Vercel) -----
  const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'organic-ilaj-data') : BUNDLED_DATA_DIR;
  const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
  const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');
  if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]');

  function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  ordersApi = {
    async getOrders() {
      return readJSON(ORDERS_FILE, []);
    },
    async addOrder(order) {
      const orders = readJSON(ORDERS_FILE, []);
      orders.push(order);
      writeJSON(ORDERS_FILE, orders);
      return order;
    },
    async updateOrderStatus(id, status) {
      const orders = readJSON(ORDERS_FILE, []);
      const order = orders.find(o => o.id === id);
      if (!order) return null;
      order.status = status;
      order.updatedAt = new Date().toISOString();
      writeJSON(ORDERS_FILE, orders);
      return order;
    }
  };

  messagesApi = {
    async getMessages() {
      return readJSON(MESSAGES_FILE, []);
    },
    async addMessage(message) {
      const messages = readJSON(MESSAGES_FILE, []);
      messages.push(message);
      writeJSON(MESSAGES_FILE, messages);
      return message;
    },
    async updateMessageStatus(id, status) {
      const messages = readJSON(MESSAGES_FILE, []);
      const message = messages.find(m => m.id === id);
      if (!message) return null;
      message.status = status;
      writeJSON(MESSAGES_FILE, messages);
      return message;
    }
  };
}

module.exports = {
  getProducts,
  ...ordersApi,
  ...messagesApi
};
