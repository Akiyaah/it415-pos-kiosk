// cart.js - add, change quantity, remove. Quantity can never go below 1 or above MAX_QTY.

function tooMany() { showToast('Invalid quantity — maximum is ' + MAX_QTY + ' per item', 'error'); }

function addToCart(id) {
  const p = productById(id);
  if (!p) return;
  const line = state.cart.find(c => c.id === id);
  if (line) {
    if (line.qty >= MAX_QTY) { tooMany(); return; }
    line.qty += 1;
  } else {
    state.cart.push({ id: id, qty: 1 });
  }
  render();
  showToast('Product added — ' + p.name);
}
function changeQty(id, delta) {
  const line = state.cart.find(c => c.id === id);
  if (!line) return;
  if (delta > 0 && line.qty >= MAX_QTY) { tooMany(); return; }
  if (delta < 0 && line.qty <= 1) { showToast('Invalid quantity — tap the trash button to remove this item', 'error'); return; }
  line.qty += delta;
  render();
}
function removeFromCart(id) {
  const p = productById(id);
  state.cart = state.cart.filter(c => c.id !== id);
  render();
  showToast('Removed — ' + p.name);
}
