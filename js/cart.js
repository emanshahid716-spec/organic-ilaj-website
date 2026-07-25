/* =====================================================
   ORGANIC ILAJ — CART (shared across every page)
   Stores the cart in localStorage so it survives page
   navigation and refreshes. Talks to the backend only at
   checkout time (see checkout page logic in script.js).
===================================================== */

'use strict';

const CART_STORAGE_KEY = 'organicIlajCart';

const Cart = {
  get() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    Cart.updateCountBadges();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
  },

  add(product, qty = 1) {
    const items = Cart.get();
    const existing = items.find(i => i.slug === product.slug);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        bg: product.bg || '#E8F3E9',
        qty
      });
    }
    Cart.save(items);
    return items;
  },

  setQty(slug, qty) {
    const items = Cart.get();
    const item = items.find(i => i.slug === slug);
    if (!item) return items;
    item.qty = Math.max(1, qty);
    Cart.save(items);
    return items;
  },

  remove(slug) {
    const items = Cart.get().filter(i => i.slug !== slug);
    Cart.save(items);
    return items;
  },

  clear() {
    Cart.save([]);
  },

  count() {
    return Cart.get().reduce((sum, i) => sum + i.qty, 0);
  },

  subtotal() {
    return Cart.get().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  updateCountBadges() {
    const count = Cart.count();
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = count; });
  }
};

// Keep the header badge correct the moment any page loads.
document.addEventListener('DOMContentLoaded', () => Cart.updateCountBadges());
