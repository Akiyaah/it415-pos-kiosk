// helpers.js - small pure helpers (money format, cart math, date) and the toast message.

// ---------- Helpers ----------
function peso(amount) {
  return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function productById(id) { return PRODUCTS.find(p => p.id === id); }
function cartLines() {
  return state.cart.map(c => {
    const p = productById(c.id);
    return { id: c.id, name: p.name, price: p.price, qty: c.qty, subtotal: p.price * c.qty };
  });
}
function cartTotal() { return cartLines().reduce((sum, l) => sum + l.subtotal, 0); }
function itemCount() { return state.cart.reduce((sum, c) => sum + c.qty, 0); }
function itemsLabel(n) { return n + (n === 1 ? ' item' : ' items'); }
function qtyOf(id) { const c = state.cart.find(x => x.id === id); return c ? c.qty : 0; }
function paidAmount() { return Number(state.paidText || 0); }
function formatDate(d) {
  const day = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\u202f/g, ' ');
  return day + ' · ' + time;
}

// ---------- Toast messages (bottom center) ----------
let toastTimer = null;
function showToast(message, type) {
  const old = document.getElementById('toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.id = 'toast';
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.innerHTML = icon(type === 'error' ? 'alert' : 'check') + '<span></span>';
  el.querySelector('span').textContent = message;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.remove(); }, 2200);
}
