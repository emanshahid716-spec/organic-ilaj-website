/* =====================================================
   ORGANIC ILAJ — ADMIN DASHBOARD
   Password login + full dashboard: overview stats, revenue
   chart, payments breakdown, orders (with filters), messages.
===================================================== */

'use strict';

const ADMIN_TOKEN_KEY = 'organicIlajAdminToken';

function getToken() { return localStorage.getItem(ADMIN_TOKEN_KEY); }
function setToken(t) { localStorage.setItem(ADMIN_TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(ADMIN_TOKEN_KEY); }

function money(n) { return 'Rs. ' + (n || 0).toLocaleString(); }

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(url, Object.assign({}, options, { headers }));
  return res.json();
}

const loginScreen = document.getElementById('admin-login-screen');
const dashboard = document.getElementById('admin-dashboard');
const loginBtn = document.getElementById('admin-login-btn');
const passwordInput = document.getElementById('admin-password-input');
const loginError = document.getElementById('admin-login-error');
const logoutBtn = document.getElementById('logout-btn');

function showDashboard() {
  loginScreen.style.display = 'none';
  dashboard.style.display = '';
  loadEverything();
}
function showLogin() {
  loginScreen.style.display = '';
  dashboard.style.display = 'none';
}

loginBtn.addEventListener('click', async () => {
  loginError.textContent = '';
  const password = passwordInput.value;
  if (!password) return;
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  try {
    const data = await apiFetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
    if (data.success) {
      setToken(data.token);
      passwordInput.value = '';
      showDashboard();
    } else {
      loginError.textContent = data.error || 'Incorrect password.';
    }
  } catch (e) {
    loginError.textContent = 'Could not reach the server.';
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
  }
});

passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

logoutBtn.addEventListener('click', async () => {
  try { await apiFetch('/api/admin/logout', { method: 'POST' }); } catch (e) {}
  clearToken();
  showLogin();
});

// ----- Sidebar nav -----
document.querySelectorAll('.admin-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('page-' + btn.dataset.tab).classList.add('active');
  });
});

function loadEverything() {
  loadStats();
  loadOrders();
  loadMessages();
}

/* =====================================================
   OVERVIEW: stats + chart + top products + recent orders
===================================================== */
async function loadStats() {
  const data = await apiFetch('/api/admin/stats');
  if (!data.success) { if (data.error === 'Not authenticated.') showLogin(); return; }
  const s = data.stats;

  document.getElementById('stat-total-revenue').textContent = money(s.totalRevenue);
  document.getElementById('stat-total-orders').textContent = s.totalOrders;
  document.getElementById('stat-avg-order').textContent = money(s.avgOrderValue);
  document.getElementById('stat-new-messages').textContent = s.newMessages;
  document.getElementById('stat-today-revenue').textContent = money(s.todayRevenue);
  document.getElementById('stat-week-revenue').textContent = money(s.weekRevenue);
  document.getElementById('stat-pending-orders').textContent = s.statusCounts.pending || 0;

  // Payments tab stats
  document.getElementById('pay-total-revenue').textContent = money(s.totalRevenue);
  const totalPaidOrders = Object.values(s.paymentBreakdown).reduce((sum, p) => sum + p.count, 0);
  document.getElementById('pay-total-orders').textContent = totalPaidOrders;

  renderRevenueChart(s.revenueByDay);
  renderTopProducts(s.topProducts);
  renderPaymentBreakdown(s.paymentBreakdown, s.totalRevenue);
  renderStatusBreakdown(s.statusCounts);
}

function renderRevenueChart(revenueByDay) {
  const svg = document.getElementById('revenue-chart');
  if (!svg) return;

  const width = 700, height = 220;
  const padding = { top: 16, right: 10, bottom: 30, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(1, ...revenueByDay.map(d => d.revenue));
  const barGap = 6;
  const barWidth = (chartW / revenueByDay.length) - barGap;

  let svgContent = '';
  revenueByDay.forEach((d, i) => {
    const barHeight = Math.max(2, (d.revenue / maxRevenue) * chartH);
    const x = padding.left + i * (barWidth + barGap);
    const y = padding.top + (chartH - barHeight);
    const dateObj = new Date(d.day + 'T00:00:00');
    const label = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

    svgContent += `
      <g>
        <rect class="chart-bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="3">
          <title>${label}: ${money(d.revenue)}</title>
        </rect>
        <text class="chart-bar-label" x="${x + barWidth / 2}" y="${height - 10}" text-anchor="middle">${label}</text>
      </g>
    `;
  });

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = revenueByDay.some(d => d.revenue > 0)
    ? svgContent
    : `<text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#999" font-size="14">No revenue yet in the last 14 days.</text>`;
}

function renderTopProducts(topProducts) {
  const el = document.getElementById('top-products-list');
  if (!topProducts.length) {
    el.innerHTML = '<p style="color:#999; font-size:14px;">No sales yet.</p>';
    return;
  }
  const maxRevenue = Math.max(...topProducts.map(p => p.revenue));
  el.innerHTML = topProducts.map(p => `
    <div class="pay-method-row">
      <div style="flex:1;">
        <div class="pay-method-name">${p.name}</div>
        <div class="pay-method-count">${p.qty} sold</div>
        <div class="pay-bar-track"><div class="pay-bar-fill" style="width:${(p.revenue / maxRevenue) * 100}%;"></div></div>
      </div>
      <div class="pay-method-revenue" style="margin-left:14px;">${money(p.revenue)}</div>
    </div>
  `).join('');
}

function renderPaymentBreakdown(breakdown, totalRevenue) {
  const el = document.getElementById('payment-breakdown-list');
  const methods = Object.entries(breakdown);
  if (!methods.length) {
    el.innerHTML = '<p style="color:#999; font-size:14px;">No payments yet.</p>';
    return;
  }
  el.innerHTML = methods.map(([name, data]) => `
    <div class="pay-method-row">
      <div style="flex:1;">
        <div class="pay-method-name">${name}</div>
        <div class="pay-method-count">${data.count} order${data.count === 1 ? '' : 's'}</div>
        <div class="pay-bar-track"><div class="pay-bar-fill" style="width:${totalRevenue ? (data.revenue / totalRevenue) * 100 : 0}%;"></div></div>
      </div>
      <div class="pay-method-revenue" style="margin-left:14px;">${money(data.revenue)}</div>
    </div>
  `).join('');
}

function renderStatusBreakdown(statusCounts) {
  const el = document.getElementById('status-breakdown-list');
  const total = Object.values(statusCounts).reduce((s, c) => s + c, 0) || 1;
  el.innerHTML = Object.entries(statusCounts).map(([status, count]) => `
    <div class="pay-method-row">
      <div style="flex:1;">
        <div class="pay-method-name"><span class="badge-status badge-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></div>
        <div class="pay-bar-track"><div class="pay-bar-fill" style="width:${(count / total) * 100}%;"></div></div>
      </div>
      <div class="pay-method-revenue" style="margin-left:14px; color:#1F2A22;">${count}</div>
    </div>
  `).join('');
}

/* =====================================================
   ORDERS (shared data powers Overview "recent", Orders tab,
   and Payments "transactions" table)
===================================================== */
let allOrders = [];

async function loadOrders() {
  const data = await apiFetch('/api/admin/orders');
  if (!data.success) { if (data.error === 'Not authenticated.') showLogin(); return; }
  allOrders = data.orders;

  renderRecentOrders(allOrders.slice(0, 5));
  renderOrdersTable(allOrders);
  renderPaymentsTable(allOrders);
}

function orderRowHTML(o, withItems) {
  return `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer.name}<br><small>${o.customer.phone}</small></td>
      ${withItems ? `<td>${o.items.map(i => `${i.name} × ${i.qty}`).join('<br>')}</td>` : ''}
      <td>${money(o.total)}</td>
      <td>${o.payment}</td>
      <td>
        <select class="status-select" data-order-id="${o.id}">
          ${['pending','confirmed','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
        </select>
      </td>
      <td>${new Date(o.createdAt).toLocaleString()}</td>
    </tr>
  `;
}

function bindStatusSelects(container) {
  container.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      await apiFetch('/api/admin/orders/' + sel.dataset.orderId, {
        method: 'PATCH',
        body: JSON.stringify({ status: sel.value })
      });
      loadStats();
      loadOrders();
    });
  });
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recent-orders-tbody');
  const table = document.getElementById('recent-orders-table');
  const empty = document.getElementById('recent-orders-empty');
  if (!orders.length) { table.style.display = 'none'; empty.style.display = ''; return; }
  table.style.display = ''; empty.style.display = 'none';
  tbody.innerHTML = orders.map(o => orderRowHTML(o, false)).join('');
  bindStatusSelects(tbody);
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-tbody');
  const table = document.getElementById('orders-table');
  const empty = document.getElementById('orders-empty');
  if (!orders.length) { table.style.display = 'none'; empty.style.display = ''; return; }
  table.style.display = ''; empty.style.display = 'none';
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer.name}<br><small>${o.customer.phone}<br>${o.customer.email}</small><br><small>${o.customer.address}, ${o.customer.city} ${o.customer.postalCode || ''}</small></td>
      <td>${o.items.map(i => `${i.name} × ${i.qty}`).join('<br>')}</td>
      <td>${money(o.total)}</td>
      <td>${o.payment}</td>
      <td>
        <select class="status-select" data-order-id="${o.id}">
          ${['pending','confirmed','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
        </select>
      </td>
      <td>${new Date(o.createdAt).toLocaleString()}</td>
    </tr>
  `).join('');
  bindStatusSelects(tbody);
}

function renderPaymentsTable(orders) {
  const tbody = document.getElementById('payments-tbody');
  const table = document.getElementById('payments-table');
  const empty = document.getElementById('payments-empty');
  if (!orders.length) { table.style.display = 'none'; empty.style.display = ''; return; }
  table.style.display = ''; empty.style.display = 'none';
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer.name}</td>
      <td>${o.payment}</td>
      <td>${money(o.total)}</td>
      <td><span class="badge-status badge-${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
      <td>${new Date(o.createdAt).toLocaleString()}</td>
    </tr>
  `).join('');
}

// ----- Orders tab filters -----
function applyOrderFilters() {
  const statusFilter = document.getElementById('order-status-filter').value;
  const paymentFilter = document.getElementById('order-payment-filter').value;
  const search = document.getElementById('order-search-input').value.trim().toLowerCase();

  const filtered = allOrders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (paymentFilter && o.payment !== paymentFilter) return false;
    if (search) {
      const haystack = `${o.id} ${o.customer.name} ${o.customer.phone}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
  renderOrdersTable(filtered);
}

document.getElementById('order-status-filter').addEventListener('change', applyOrderFilters);
document.getElementById('order-payment-filter').addEventListener('change', applyOrderFilters);
document.getElementById('order-search-input').addEventListener('input', applyOrderFilters);

/* =====================================================
   MESSAGES
===================================================== */
async function loadMessages() {
  const data = await apiFetch('/api/admin/messages');
  if (!data.success) return;

  const tbody = document.getElementById('messages-tbody');
  const emptyEl = document.getElementById('messages-empty');
  const table = document.getElementById('messages-table');

  if (data.messages.length === 0) {
    table.style.display = 'none';
    emptyEl.style.display = '';
    return;
  }
  table.style.display = '';
  emptyEl.style.display = 'none';

  tbody.innerHTML = data.messages.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.email}</td>
      <td>${m.subject}</td>
      <td style="max-width:280px;">${m.message}</td>
      <td>
        <select class="status-select" data-msg-id="${m.id}">
          ${['new','read','replied'].map(s => `<option value="${s}" ${s === m.status ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
        </select>
      </td>
      <td>${new Date(m.createdAt).toLocaleString()}</td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      await apiFetch('/api/admin/messages/' + sel.dataset.msgId, {
        method: 'PATCH',
        body: JSON.stringify({ status: sel.value })
      });
      loadStats();
    });
  });
}

// ----- Init -----
if (getToken()) {
  showDashboard();
} else {
  showLogin();
}
