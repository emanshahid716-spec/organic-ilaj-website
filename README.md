# Organic Ilaj — Website + Backend

Yeh package do hisson mein hai:

1. **Frontend** — root folder ke saare `.html`, `css/`, `js/`, `images/` files (aapki purani website, thora update ke sath).
2. **Backend** — `server/` folder mein ek chota Node.js server jo:
   - Contact form ke messages save karta hai
   - Checkout se orders save karta hai (order number generate hota hai)
   - Cart properly kaam karta hai (localStorage mein save hota hai, sab pages par)
   - Admin panel deta hai (`/admin.html`) jahan aap orders & messages dekh saken

Koi bhi database install karne ki zaroorat nahi — sab data simple JSON files mein
`server/data/` folder ke andar save hota hai (`orders.json`, `messages.json`).

---

## Kaise chalayein (local test)

Aapke computer par [Node.js](https://nodejs.org) installed hona chahiye (v18+).

```bash
cd server
npm install
cp .env.example .env
```

Ab `.env` file khol kar `ADMIN_PASSWORD` change kar dein (apna khud ka password rakhein):

```
ADMIN_PASSWORD=aap-ka-password
```

Phir server start karein:

```bash
npm start
```

Browser mein jaayein:

- **Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin.html (login uss password se jo `.env` mein set kiya)

Server hi poori website serve karta hai — alag se koi live-server chalane ki zaroorat nahi.

---

## Deploy kaise karein (apne VPS/hosting par)

1. Poora folder (frontend + `server/`) apne server par upload karein.
2. `server/` folder ke andar jaake `npm install` chalayein.
3. `.env` file banayein (`.env.example` se copy karein) aur `ADMIN_PASSWORD` + `PORT` set karein.
4. Server ko hamesha chalta rakhne ke liye [pm2](https://pm2.keymetrics.io/) use karein:
   ```bash
   npm install -g pm2
   pm2 start server.js --name organic-ilaj
   pm2 save
   ```
5. Agar aapke paas domain hai, Nginx ko reverse-proxy ki tarah is Node server (port 3000) ki taraf point kar dein.

---

## Important: Product prices sync

Product catalog abhi bhi `js/products-data.js` mein hai (website ka source of truth —
isi se home/shop/product pages banti hain). Backend order-checkout ke waqt price
verify karne ke liye **apni khud ki copy** `server/data/products.json` use karta hai
(taake koi customer browser se price change karke fraud na kar sake).

Jab bhi aap `js/products-data.js` mein koi product add/edit/price change karein,
yeh command chalayein taake backend bhi update ho jaye:

```bash
cd server
npm run sync-products
```

---

## Kya-kya bana hai

- ✅ Contact form → real backend (`POST /api/contact`) — messages `server/data/messages.json` mein save hote hain
- ✅ Cart → localStorage se poori site par kaam karta hai (add/remove/qty save rehti hai)
- ✅ Checkout → real order backend (`POST /api/orders`) — order number milta hai, order-confirmation page par redirect hota hai
- ✅ **Complete Admin Dashboard** (`/admin.html`) — password-protected, 4 sections:
  - **Overview** — total revenue, total orders, average order value, new messages, today's/last 7 days revenue, pending orders, 14-day revenue chart, top selling products, recent orders
  - **Orders** — full order list with filters (status, payment method, search by name/phone/order ID), status update (pending/confirmed/shipped/delivered/cancelled)
  - **Payments** — total revenue, breakdown by payment method (Cash on Delivery vs Card), order status breakdown, full transaction table
  - **Messages** — contact form ke saare messages, status update (new/read/replied)
- ✅ About page par nayi product photo add ki gayi

## Files jo naye hain / update hue

- `server/` — poora backend (naya) — ab `/api/admin/stats` endpoint bhi hai jo dashboard ke liye revenue/payments/top-products calculate karta hai
- `js/cart.js` — shared cart logic (naya)
- `js/admin.js` — complete admin dashboard logic (naya)
- `admin.html` — full dashboard page — sidebar navigation, stat cards, revenue chart, payments breakdown (naya)
- `order-confirmation.html` — order confirm hone ke baad ki page (naya)
- `about.html` — nayi image add ki gayi
- `cart.html`, `checkout.html` — dynamic bana diya gaya (real cart se connect)
- `js/script.js` — cart + contact + checkout logic backend se connect kiya gaya
