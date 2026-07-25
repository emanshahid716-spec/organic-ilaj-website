/* =====================================================
   ORGANIC ILAJ — MAIN JAVASCRIPT
   Vanilla ES6. No inline JS anywhere in the HTML —
   everything wires up from here, filled in during
   Step 18 (and progressively as interactive UI is built).
===================================================== */
 
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ===== Navbar: sticky/transparent + mobile menu =====
  const header = document.getElementById('site-header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navbarMenu = document.getElementById('navbar-menu');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  if (hamburgerBtn && navbarMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navbarMenu.classList.toggle('is-open');
      hamburgerBtn.classList.toggle('is-active');
    });
  }

  // ===== Scroll-reveal animation for .reveal elements =====
  // Safety-first: if IntersectionObserver is unsupported or anything
  // goes wrong, elements must NOT stay permanently invisible.
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // Fallback: force-reveal anything the observer hasn't caught
    // within 1.2s (covers edge cases on some mobile/webview browsers).
    setTimeout(() => {
      revealEls.forEach(el => el.classList.add('is-visible'));
    }, 1200);
  } else {
    // No IntersectionObserver support -> show everything immediately.
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ===== Cart: Add to Cart button (works everywhere via event delegation) =====
  // Cart.updateCountBadges() (from cart.js) already syncs .cart-count on load.
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      const card = addBtn.closest('.product-card');
      if (card && typeof Cart !== 'undefined') {
        const link = card.querySelector('a[href*="product.html?slug="]');
        const slugMatch = link ? link.getAttribute('href').match(/slug=([^&]+)/) : null;
        const slug = slugMatch ? decodeURIComponent(slugMatch[1]) : null;
        const name = card.querySelector('h4 a, h4')?.textContent.trim();
        const priceText = card.querySelector('.price-current')?.textContent || '';
        const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
        const imgEl = card.querySelector('.product-img img');
        const image = imgEl ? imgEl.src : '';
        const imgWrap = card.querySelector('.product-img');
        const bg = imgWrap ? imgWrap.style.backgroundColor : '#E8F3E9';

        if (slug) {
          Cart.add({ slug, name, price, image, bg }, 1);
        }
      }
      const original = addBtn.textContent;
      addBtn.textContent = 'Added ✓';
      setTimeout(() => { addBtn.textContent = original; }, 1200);
      return;
    }
    const wishBtn = e.target.closest('.wishlist-btn');
    if (wishBtn) {
      wishBtn.classList.toggle('active');
      wishBtn.style.color = wishBtn.classList.contains('active') ? '#D32F2F' : '';
    }
  });

  // ===== Newsletter form validation =====
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterMsg = document.getElementById('newsletter-msg');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      if (email) {
        newsletterMsg.textContent = "Thank you! Check your inbox for your discount code.";
        newsletterForm.reset();
      }
    });
  }

  // ===== Contact form (submits to backend /api/contact) =====
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"], button');
    let contactStatusEl = document.getElementById('contact-form-status');
    if (!contactStatusEl) {
      contactStatusEl = document.createElement('p');
      contactStatusEl.id = 'contact-form-status';
      contactStatusEl.style.marginTop = '12px';
      contactForm.appendChild(contactStatusEl);
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const [nameInput, emailInput, subjectInput] = contactForm.querySelectorAll('input');
      const messageInput = contactForm.querySelector('textarea');

      const payload = {
        name: nameInput?.value || '',
        email: emailInput?.value || '',
        subject: subjectInput?.value || '',
        message: messageInput?.value || ''
      };

      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      contactStatusEl.style.color = '';
      contactStatusEl.textContent = '';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          contactStatusEl.style.color = 'var(--color-primary)';
          contactStatusEl.textContent = data.message || 'Thank you! Your message has been sent.';
          contactForm.reset();
        } else {
          contactStatusEl.style.color = '#D32F2F';
          contactStatusEl.textContent = data.error || 'Something went wrong. Please try again.';
        }
      } catch (err) {
        contactStatusEl.style.color = '#D32F2F';
        contactStatusEl.textContent = 'Could not reach the server. Please try again shortly.';
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
      }
    });
  }

  // ===== Global Search Overlay (works from header on every page) =====
  const searchOverlay = document.getElementById('search-overlay');
  const navSearchBtn = document.getElementById('nav-search-btn');
  const searchOverlayClose = document.getElementById('search-overlay-close');
  const globalSearchInput = document.getElementById('global-search-input');
  const globalSearchResults = document.getElementById('global-search-results');

  const navbarSearchInput = document.getElementById('navbar-search-input');

  function openSearchOverlay(prefill) {
    if (!searchOverlay) return;
    searchOverlay.classList.add('active');
    document.body.classList.add('search-open');
    setTimeout(() => {
      if (globalSearchInput) {
        globalSearchInput.focus();
        if (prefill) {
          globalSearchInput.value = prefill;
          renderSearchResults(prefill);
        }
      }
    }, 50);
    if (!prefill) renderSearchResults('');
  }

  if (navbarSearchInput) {
    navbarSearchInput.addEventListener('focus', () => openSearchOverlay(navbarSearchInput.value));
    navbarSearchInput.addEventListener('input', () => openSearchOverlay(navbarSearchInput.value));
  }

  function closeSearchOverlay() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('active');
    document.body.classList.remove('search-open');
  }

  function renderSearchResults(query) {
    if (!globalSearchResults || typeof ORGANIC_ILAJ_PRODUCTS === 'undefined') return;
    const q = query.trim().toLowerCase();

    let results;
    if (!q) {
      // No query yet: show a handful of popular products as suggestions.
      results = [...ORGANIC_ILAJ_PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
    } else {
      results = ORGANIC_ILAJ_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q)
      );
    }

    if (results.length === 0) {
      globalSearchResults.innerHTML = `<p class="search-empty-msg">No products found for "${query}". Try "height", "weight loss", "oil"...</p>`;
      return;
    }

    globalSearchResults.innerHTML = results.map(p => `
      <a href="product.html?slug=${p.slug}" class="search-result-item">
        <div class="search-result-thumb" style="background-color:${p.bg};">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="search-result-info">
          <h6>${p.name}</h6>
          <span>Rs. ${p.price.toLocaleString()}</span>
        </div>
      </a>
    `).join('');
  }

  if (navSearchBtn) {
    navSearchBtn.addEventListener('click', openSearchOverlay);
  }
  if (searchOverlayClose) {
    searchOverlayClose.addEventListener('click', closeSearchOverlay);
  }
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearchOverlay();
    });
  }
  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', () => renderSearchResults(globalSearchInput.value));
    globalSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && globalSearchInput.value.trim()) {
        window.location.href = 'shop.html?search=' + encodeURIComponent(globalSearchInput.value.trim());
      }
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearchOverlay();
  });

  // ===== Product Detail Page: render from URL ?slug= param =====
  const productNameEl = document.getElementById('product-name');
  if (productNameEl && typeof ORGANIC_ILAJ_PRODUCTS !== 'undefined') {
    function initProductDetailPage(slug) {
      if (!productNameEl) return;
      const p = getProductBySlug(slug);

      document.title = p.name + ' | Organic Ilaj';
      document.getElementById('product-category').textContent = p.category;
      productNameEl.textContent = p.name;
      document.getElementById('product-reviews-count').textContent = `(${p.reviews} reviews)`;
      document.getElementById('product-reviews-heading').textContent = `Customer Reviews (${p.reviews})`;
      document.getElementById('product-price-current').textContent = 'Rs. ' + p.price.toLocaleString();
      document.getElementById('product-short-desc').textContent = p.shortDesc;
      document.getElementById('product-description').textContent = p.description;
      document.getElementById('product-ingredients').textContent = p.ingredients;
      document.getElementById('product-howtouse').textContent = p.howToUse;
      document.getElementById('product-warnings').textContent = p.warnings;

      const oldPriceEl = document.getElementById('product-price-old');
      const badgeEl = document.getElementById('product-badge');
      if (p.oldPrice && p.oldPrice > p.price) {
        oldPriceEl.textContent = 'Rs. ' + p.oldPrice.toLocaleString();
        oldPriceEl.style.display = '';
      } else {
        oldPriceEl.style.display = 'none';
      }
      if (p.badge) {
        badgeEl.textContent = p.badge;
        badgeEl.className = 'badge ' + (p.badge.startsWith('-') ? 'badge-danger' : 'badge-primary');
        badgeEl.style.display = '';
      } else {
        badgeEl.style.display = 'none';
      }

      const benefitsList = document.getElementById('product-benefits-list');
      if (benefitsList) {
        benefitsList.innerHTML = p.benefits.map(b => `<li>${b}</li>`).join('');
      }

      // Gallery images + background colors
      const galleryImgs = (p.gallery && p.gallery.length) ? p.gallery : [p.image, p.image, p.image, p.image];
      const mainProductImg = document.getElementById('main-product-img');
      if (mainProductImg) {
        mainProductImg.src = galleryImgs[0];
        mainProductImg.alt = p.name;
      }
      [1, 2, 3, 4].forEach((n, i) => {
        const img = document.getElementById('thumb-img-' + n);
        if (!img) return;
        const thumbEl = img.closest('.gallery-thumb');
        const src = galleryImgs[i % galleryImgs.length];
        img.src = src;
        img.alt = p.name + ' view ' + n;
        img.style.opacity = '';
        if (thumbEl && i >= galleryImgs.length) {
          thumbEl.style.display = 'none';
        } else if (thumbEl) {
          thumbEl.style.display = '';
          thumbEl.classList.toggle('active', i === 0);
        }
      });
      const galleryMain = document.getElementById('gallery-main');
      if (galleryMain) galleryMain.style.backgroundColor = p.bg;
      document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        thumb.style.backgroundColor = p.bg;
        thumb.dataset.color = p.bg;
      });

      // Dynamic Size/Variant Selector
      const variantSelectorEl = document.getElementById('product-variant-selector');
      const variantBtnsContainer = document.getElementById('variant-btns-container');

      if (variantSelectorEl && variantBtnsContainer) {
        const variants = ORGANIC_ILAJ_PRODUCTS.filter(x => x.category === p.category);
        if (variants.length > 1) {
          variantSelectorEl.style.display = ''; // Show selector
          variantBtnsContainer.innerHTML = ''; // Clear container

          variants.forEach(v => {
            // Extract size (e.g. "30ml", "50g")
            const match = v.name.match(/(\d+\s*(?:ml|g))/i);
            const sizeLabel = match ? match[1] : v.name;

            const btn = document.createElement('button');
            btn.className = 'variant-btn' + (v.slug === p.slug ? ' active' : '');
            btn.textContent = sizeLabel;
            btn.addEventListener('click', () => {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('slug', v.slug);
              window.history.pushState({ slug: v.slug }, '', newUrl.toString());
              initProductDetailPage(v.slug);
            });
            variantBtnsContainer.appendChild(btn);
          });
        } else {
          variantSelectorEl.style.display = 'none';
        }
      }

      // Related products: same category first, then fill with others
      const related = ORGANIC_ILAJ_PRODUCTS
        .filter(x => x.slug !== p.slug)
        .sort((a, b) => (a.category === p.category ? -1 : 0) - (b.category === p.category ? -1 : 0))
        .slice(0, 4);

      const relatedGrid = document.getElementById('related-products-grid');
      if (relatedGrid) {
        relatedGrid.innerHTML = related.map(r => `
          <div class="product-card reveal is-visible">
            <a href="product.html?slug=${r.slug}">
              <div class="product-img" style="background-color:${r.bg};">
                <img src="${r.image}" alt="${r.name}" loading="lazy">
                <button class="quick-view-btn">Quick View</button>
              </div>
            </a>
            <div class="product-info">
              <h4><a href="product.html?slug=${r.slug}">${r.name}</a></h4>
              <div class="product-price"><span class="price-current">Rs. ${r.price.toLocaleString()}</span></div>
              <button class="btn btn-primary add-to-cart-btn">Add to Cart</button>
            </div>
          </div>
        `).join('');
      }

      // Add to Cart / Buy Now for THIS product (uses the quantity selector above)
      const addToCartBtn = document.getElementById('product-add-to-cart-btn');
      const buyNowBtn = document.getElementById('product-buy-now-btn');
      const qtyInputEl = document.getElementById('qty-input');

      if (addToCartBtn && typeof Cart !== 'undefined') {
        const newAddToCartBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);
        newAddToCartBtn.addEventListener('click', () => {
          const qty = parseInt(qtyInputEl?.value, 10) || 1;
          Cart.add(p, qty);
          const original = newAddToCartBtn.textContent;
          newAddToCartBtn.textContent = 'Added ✓';
          setTimeout(() => { newAddToCartBtn.textContent = original; }, 1200);
        });
      }
      if (buyNowBtn && typeof Cart !== 'undefined') {
        const newBuyNowBtn = buyNowBtn.cloneNode(true);
        buyNowBtn.parentNode.replaceChild(newBuyNowBtn, buyNowBtn);
        newBuyNowBtn.addEventListener('click', () => {
          const qty = parseInt(qtyInputEl?.value, 10) || 1;
          Cart.add(p, qty);
          window.location.href = 'checkout.html';
        });
      }
    }

    const params = new URLSearchParams(window.location.search);
    const initialSlug = params.get('slug');
    initProductDetailPage(initialSlug);

    window.addEventListener('popstate', (e) => {
      const activeParams = new URLSearchParams(window.location.search);
      const activeSlug = activeParams.get('slug');
      if (activeSlug) {
        initProductDetailPage(activeSlug);
      }
    });
  }

  // ===== Product Page: Quantity selector =====
  const qtyInput = document.getElementById('qty-input');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  if (qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value);
      if (val > 1) qtyInput.value = val - 1;
    });
    qtyPlus.addEventListener('click', () => {
      qtyInput.value = parseInt(qtyInput.value) + 1;
    });
  }

  // ===== Product Page: Gallery thumbnail switching =====
  const galleryMain = document.getElementById('gallery-main');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');

  galleryThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      galleryThumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      galleryMain.style.backgroundColor = thumb.dataset.color;
      const thumbImg = thumb.querySelector('img');
      const mainImg = document.getElementById('main-product-img');
      if (thumbImg && mainImg) {
        mainImg.src = thumbImg.src;
      }
    });
  });

  // ===== Product Page: Tabs =====
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // ===== Cart Page: render dynamically from the saved cart =====
  const cartTableBody = document.getElementById('cart-table-body');
  if (cartTableBody && typeof Cart !== 'undefined') {
    function renderCartPage() {
      const items = Cart.get();
      const cartTable = document.getElementById('cart-table');
      const emptyMsg = document.getElementById('cart-empty-msg');
      const checkoutBtn = document.getElementById('cart-checkout-btn');

      if (items.length === 0) {
        if (cartTable) cartTable.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = '';
        if (checkoutBtn) {
          checkoutBtn.style.pointerEvents = 'none';
          checkoutBtn.style.opacity = '0.5';
        }
      } else {
        if (cartTable) cartTable.style.display = '';
        if (emptyMsg) emptyMsg.style.display = 'none';
        if (checkoutBtn) { checkoutBtn.style.pointerEvents = ''; checkoutBtn.style.opacity = ''; }
      }

      cartTableBody.innerHTML = items.map(item => `
        <tr class="cart-row" data-slug="${item.slug}">
          <td class="cart-product">
            <div class="cart-thumb" style="background-color:${item.bg || '#E8F3E9'};">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <span>${item.name}</span>
          </td>
          <td>Rs. ${item.price.toLocaleString()}</td>
          <td>
            <div class="qty-controls">
              <button class="qty-btn cart-qty-minus">−</button>
              <input type="text" value="${item.qty}" class="cart-qty-input" readonly>
              <button class="qty-btn cart-qty-plus">+</button>
            </div>
          </td>
          <td class="cart-subtotal">Rs. ${(item.price * item.qty).toLocaleString()}</td>
          <td><button class="cart-remove" aria-label="Remove">✕</button></td>
        </tr>
      `).join('');

      const subtotal = Cart.subtotal();
      const subtotalEl = document.getElementById('cart-subtotal-value');
      const totalEl = document.getElementById('cart-total-value');
      if (subtotalEl) subtotalEl.textContent = 'Rs. ' + subtotal.toLocaleString();
      if (totalEl) totalEl.textContent = 'Rs. ' + subtotal.toLocaleString();
    }

    cartTableBody.addEventListener('click', (e) => {
      const row = e.target.closest('.cart-row');
      if (!row) return;
      const slug = row.dataset.slug;

      if (e.target.closest('.cart-qty-plus')) {
        const item = Cart.get().find(i => i.slug === slug);
        Cart.setQty(slug, (item ? item.qty : 1) + 1);
        renderCartPage();
      } else if (e.target.closest('.cart-qty-minus')) {
        const item = Cart.get().find(i => i.slug === slug);
        const newQty = (item ? item.qty : 1) - 1;
        if (newQty < 1) return;
        Cart.setQty(slug, newQty);
        renderCartPage();
      } else if (e.target.closest('.cart-remove')) {
        Cart.remove(slug);
        renderCartPage();
      }
    });

    renderCartPage();
  }

  // ===== Shop Page: Search + Category + Price + Availability filters, and Sort =====
  const shopGrid = document.getElementById('shop-grid');
  const priceRange = document.getElementById('price-range');
  const priceValue = document.getElementById('price-value');

  if (shopGrid && priceRange) {
    const searchInput = document.getElementById('filter-search');
    const categoryChecks = Array.from(document.querySelectorAll('.filter-category'));
    const stockChecks = Array.from(document.querySelectorAll('.filter-stock'));
    const sortSelect = document.getElementById('shop-sort');
    const resetBtn = document.getElementById('filter-reset');
    const countEl = document.getElementById('shop-count');
    const noResultsEl = document.getElementById('shop-no-results');

    // Keep every card + its original position so "Popularity"/"Newest"
    // sorting always has a stable order to fall back on.
    const cards = Array.from(shopGrid.querySelectorAll('.product-card'));
    cards.forEach((card, i) => {
      card.dataset.originalIndex = i;
      const reviewsMatch = card.querySelector('.product-rating span');
      card.dataset.reviews = reviewsMatch ? (reviewsMatch.textContent.match(/\d+/) || [0])[0] : 0;
    });
    const totalCount = cards.length;

    function applyFilters() {
      const query = (searchInput?.value || '').trim().toLowerCase();
      const checkedCategories = categoryChecks.filter(c => c.checked).map(c => c.value);
      const checkedStock = stockChecks.filter(c => c.checked).map(c => c.value);
      const maxPrice = parseInt(priceRange.value, 10);

      let visibleCount = 0;

      cards.forEach(card => {
        const name = card.querySelector('h4 a')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';
        const category = card.dataset.category;
        const stock = card.dataset.stock;
        const price = parseInt(card.dataset.price, 10);

        const matchesSearch = !query || name.includes(query) || desc.includes(query) || category.toLowerCase().includes(query);
        const matchesCategory = checkedCategories.includes(category);
        const matchesStock = checkedStock.includes(stock);
        const matchesPrice = price <= maxPrice;

        const visible = matchesSearch && matchesCategory && matchesStock && matchesPrice;
        card.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
      });

      if (countEl) countEl.textContent = `Showing ${visibleCount} of ${totalCount} products`;
      if (noResultsEl) noResultsEl.style.display = visibleCount === 0 ? '' : 'none';
      shopGrid.style.display = visibleCount === 0 ? 'none' : '';

      applySort();
    }

    function applySort() {
      const mode = sortSelect ? sortSelect.value : 'popularity';
      const sorted = [...cards].sort((a, b) => {
        if (mode === 'price-low') return a.dataset.price - b.dataset.price;
        if (mode === 'price-high') return b.dataset.price - a.dataset.price;
        if (mode === 'newest') return b.dataset.originalIndex - a.dataset.originalIndex;
        // Popularity (default): most reviews first
        return b.dataset.reviews - a.dataset.reviews;
      });
      sorted.forEach(card => shopGrid.appendChild(card));
    }

    // Support deep-linking from category tiles / global search:
    // shop.html?category=Camstrich%20Oil or shop.html?search=height
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    const urlSearch = urlParams.get('search');
    if (urlCategory) {
      categoryChecks.forEach(c => c.checked = (c.value === urlCategory));
    }
    if (urlSearch && searchInput) {
      searchInput.value = urlSearch;
    }

    searchInput?.addEventListener('input', applyFilters);
    categoryChecks.forEach(c => c.addEventListener('change', applyFilters));
    stockChecks.forEach(c => c.addEventListener('change', applyFilters));
    sortSelect?.addEventListener('change', applyFilters);
    priceRange.addEventListener('input', () => {
      priceValue.textContent = priceRange.value;
      applyFilters();
    });

    resetBtn?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      categoryChecks.forEach(c => c.checked = true);
      stockChecks.forEach(c => c.checked = c.value === 'in-stock');
      priceRange.value = priceRange.max;
      priceValue.textContent = priceRange.value;
      if (sortSelect) sortSelect.value = 'popularity';
      applyFilters();
    });

    // Initial run so the count/sort reflect the default filter state on load.
    applyFilters();
  } else if (priceRange) {
    // Fallback for any page with a price slider but no shop grid.
    priceRange.addEventListener('input', () => {
      priceValue.textContent = priceRange.value;
    });
  }


  // ===== Checkout Page: render summary from cart + submit order to backend =====
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm && typeof Cart !== 'undefined') {
    const summaryItemsEl = document.getElementById('checkout-summary-items');
    const totalValueEl = document.getElementById('checkout-total-value');
    const statusEl = document.getElementById('checkout-form-status');
    const placeOrderBtn = document.getElementById('checkout-place-order-btn');

    function renderCheckoutSummary() {
      const items = Cart.get();
      if (summaryItemsEl) {
        summaryItemsEl.innerHTML = items.length
          ? items.map(i => `<div class="summary-row"><span>${i.name} × ${i.qty}</span><span>Rs. ${(i.price * i.qty).toLocaleString()}</span></div>`).join('')
          : '<p>Your cart is empty. <a href="shop.html">Continue shopping →</a></p>';
      }
      const total = Cart.subtotal();
      if (totalValueEl) totalValueEl.textContent = 'Rs. ' + total.toLocaleString();
      if (placeOrderBtn) placeOrderBtn.disabled = items.length === 0;
    }
    renderCheckoutSummary();

    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const items = Cart.get();
      if (items.length === 0) {
        statusEl.style.color = '#D32F2F';
        statusEl.textContent = 'Your cart is empty.';
        return;
      }

      const payload = {
        customer: {
          name: document.getElementById('checkout-name')?.value || '',
          phone: document.getElementById('checkout-phone')?.value || '',
          email: document.getElementById('checkout-email')?.value || '',
          address: document.getElementById('checkout-address')?.value || '',
          city: document.getElementById('checkout-city')?.value || '',
          postalCode: document.getElementById('checkout-postal')?.value || ''
        },
        payment: checkoutForm.querySelector('input[name="payment"]:checked')?.value || 'cod',
        items: items.map(i => ({ slug: i.slug, qty: i.qty }))
      };

      const originalText = placeOrderBtn.textContent;
      placeOrderBtn.disabled = true;
      placeOrderBtn.textContent = 'Placing Order...';
      statusEl.style.color = '';
      statusEl.textContent = '';

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          Cart.clear();
          window.location.href = 'order-confirmation.html?order=' + encodeURIComponent(data.order.id);
        } else {
          statusEl.style.color = '#D32F2F';
          statusEl.textContent = data.error || 'Something went wrong placing your order.';
          placeOrderBtn.disabled = false;
          placeOrderBtn.textContent = originalText;
        }
      } catch (err) {
        statusEl.style.color = '#D32F2F';
        statusEl.textContent = 'Could not reach the server. Please try again shortly.';
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = originalText;
      }
    });
  }

  // ===== Contact Page: FAQ accordion =====
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item.active').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });
      if (!wasActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
      }
    });
  });

});
