// Slurp Noodle House Kiosk - redesign stage (noodle-shop theme, tablet layout)
// Only the VIEW changed in this stage (markup, icons, illustrations). The cart, payment,
// validation and transaction logic is exactly the same as before.
// Every screen is drawn by a small function that returns HTML.
// The cart, cash entry, payment and receipt use REAL data.
// Stage 4: strict cash validation (blank, invalid, negative, insufficient) with a red alert box.

// ---------- State ----------
const STORAGE_KEY = 'slurpNoodleNextTxn';   // remembers the next transaction number
const MAX_QTY = 99;                         // largest quantity for one item
const MAX_PAID_DIGITS = 6;                  // most digits typed on the keypad
const MAX_PAID = 999999;                    // largest cash amount in total

const state = {
  screen: 'order',      // order | review | payment | cash | qr | card | success | receipt
  filter: 'All',        // All | Drinks | Food | Snacks
  cart: [],             // [{ id, qty }] - starts empty
  paidText: '',         // digits typed on the cash keypad, e.g. "200"
  quick: null,          // which quick button looks selected: 'exact' | '200' | '500' | '1000' | null
  quickSum: 0,          // total of the quick amounts tapped so far (they add up: 200 + 500 = 700)
  quickCount: 0,        // how many quick amounts were tapped
  quickKey: null,       // the last quick button tapped
  typedText: '',        // digits typed on the keypad (typing and quick amounts never mix: the last one used wins)
  cashError: null,      // { title, text } shown in the red alert box when Pay Now is rejected
  processing: false,    // true while the simulated card payment is running
  transaction: null     // the completed transaction (set only after a successful payment)
};

// Transaction numbers: TXN-<year>-<5 digit number>. The number goes up by 1 for every
// COMPLETED transaction, so two transactions never share a reference.
// It is kept in memory and saved to Local Storage so it survives a page reload.
let nextSeq = loadSeq();
function loadSeq() {
  try {
    const n = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    return n > 0 ? n : 1;
  } catch (e) { return 1; }
}
function saveSeq() {
  try { localStorage.setItem(STORAGE_KEY, String(nextSeq)); } catch (e) { /* storage unavailable: keep counting in memory */ }
}
function reference(prefix) {
  return prefix + '-' + new Date().getFullYear() + '-' + String(nextSeq).padStart(5, '0');
}

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

// ---------- Cart actions ----------
function addToCart(id) {
  const p = productById(id);
  if (!p) return;
  const line = state.cart.find(c => c.id === id);
  if (line) {
    if (line.qty >= MAX_QTY) { showToast('Invalid quantity — maximum is ' + MAX_QTY + ' per item', 'error'); return; }
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
  if (delta > 0 && line.qty >= MAX_QTY) { showToast('Invalid quantity — maximum is ' + MAX_QTY + ' per item', 'error'); return; }
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

// ---------- Payment + transaction ----------
// Creates the transaction ONLY after a payment is accepted. The order is copied (snapshot)
// so the success screen and receipt always show exactly what was paid for.
function completePayment(method, paid) {
  const total = cartTotal();
  if (state.cart.length === 0 || paid < total) return;   // never complete an invalid payment
  state.transaction = {
    txn: reference('TXN'),
    method: method,
    lines: cartLines(),
    total: total,
    paid: paid,
    change: paid - total,
    date: new Date()
  };
  nextSeq += 1;
  saveSeq();
  state.processing = false;
  state.screen = 'success';
  render();
}
// Checks the cash entry BEFORE any transaction is created.
// Returns null when the payment is valid, or { title, text } describing the problem.
function validateCash() {
  const total = cartTotal();
  const text = state.paidText;
  if (text === '') {
    return { title: 'Amount required.', text: 'Please enter the amount paid, or tap a quick amount.' };
  }
  const paid = Number(text);
  if (!/^\d+$/.test(text) || !isFinite(paid)) {
    return { title: 'Invalid amount.', text: 'Please enter numbers only, for example 200.' };
  }
  if (paid < 0) {
    return { title: 'Invalid amount.', text: 'The amount paid cannot be negative.' };
  }
  if (paid < total) {
    return {
      title: 'Insufficient payment.',
      text: 'Please enter at least ' + peso(total) + '. You are short by ' + peso(total - paid) + '.'
    };
  }
  return null;   // paid >= total (exact payment is valid, change = ₱0.00)
}
function payCash() {
  const problem = validateCash();
  if (problem) {
    state.cashError = problem;   // red alert box + red border on the amount box
    state.quick = null;          // no quick amount stays selected
    render();
    return;                      // stay on the cash screen; no transaction, no receipt
  }
  state.cashError = null;
  completePayment('Cash', paidAmount());
}
function payQR() { completePayment('QR Payment', cartTotal()); }
function payCard() {
  if (state.processing) return;
  state.processing = true;
  render();                                   // shows the animated progress bar
  setTimeout(function () { completePayment('Credit / Debit Card', cartTotal()); }, 1800);
}
function newTransaction() {
  state.cart = [];
  resetCash();
  state.processing = false;
  state.transaction = null;
  state.filter = 'All';
  state.screen = 'order';
  render();
  showToast('New transaction started — previous order cleared');
}

// ---------- Navigation ----------
function goTo(screen) {
  const needsOrder = ['review', 'payment', 'cash', 'qr', 'card'];
  if (needsOrder.indexOf(screen) !== -1 && state.cart.length === 0) {
    state.screen = 'order';
    render();
    showToast('Your order is empty — add a product first', 'error');
    return;
  }
  if (screen === 'receipt' && !state.transaction) return;
  if (screen === 'cash') resetCash();   // fresh cash entry
  state.screen = screen;
  render();
}

// ---------- Cash keypad ----------
// The amount paid is EITHER the quick amounts tapped (they add up: ₱200 + ₱500 = ₱700)
// OR the digits typed on the keypad. Switching from one to the other starts a fresh amount,
// so tapping ₱200 and then typing 5 gives ₱5, never ₱2,005.
function resetCash() {
  state.paidText = ''; state.quickSum = 0; state.quickCount = 0; state.quickKey = null;
  state.typedText = ''; state.quick = null; state.cashError = null;
}
// Rebuilds paidText (the amount shown and validated) from the quick amounts or the typed digits.
function syncPaid() {
  const hasAny = state.quickCount > 0 || state.typedText !== '';
  state.paidText = hasAny ? String(state.quickSum + Number(state.typedText || 0)) : '';
  // Only highlight a quick button while it is the whole amount (a single tap, nothing typed).
  state.quick = (state.quickCount === 1 && state.typedText === '') ? state.quickKey : null;
}
function pressKey(digit) {
  if (state.quickCount > 0) { state.quickSum = 0; state.quickCount = 0; state.quickKey = null; state.typedText = ''; }   // typing starts fresh
  if (state.typedText === '' && digit === '0') { syncPaid(); render(); return; }   // no leading zeros
  if (state.typedText.length >= MAX_PAID_DIGITS) {
    showToast('Amount is too large', 'error'); return;
  }
  state.typedText += digit;
  state.cashError = null;
  syncPaid();
  render();
}
function pickQuick(key) {
  // Exact replaces the amount; typed digits are replaced too. Other quick amounts add up.
  if (key === 'exact' || state.quickKey === 'exact' || state.typedText !== '') { state.quickSum = 0; state.quickCount = 0; state.typedText = ''; }
  const amount = key === 'exact' ? cartTotal() : Number(key);
  if (state.quickSum + amount > MAX_PAID) { showToast('Amount is too large', 'error'); return; }
  state.quickSum += amount;
  state.quickCount += 1;
  state.quickKey = key;
  state.cashError = null;
  syncPaid();
  render();
}
function backspace() {
  if (state.typedText !== '') state.typedText = state.typedText.slice(0, -1);
  else { state.quickSum = 0; state.quickCount = 0; state.quickKey = null; }   // nothing typed: undo the quick amounts
  state.cashError = null;
  syncPaid();
  render();
}

// ---------- Icons (simple line icons, 24x24) ----------
const ICON_ATTR = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
const ICONS = {
  all:       '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  noodles:   '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8.5 21h7"/><path d="M13.5 3.5L11 9M17 4.5L14.5 9"/>',
  sides:     '<path d="M3 17c0-5.5 4-9.5 9-9.5s9 4 9 9.5z"/><path d="M8 11.5l1 5.5M12 9.5v7.5M16 11.5l-1 5.5"/>',
  drinks:    '<path d="M6 8h12l-1.5 12h-9z"/><path d="M12 8V3l4-1"/><path d="M6.7 13h10.6"/>',
  trash:     '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  cart:      '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.5 12h11L21 7H6"/>',
  cash:      '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 10h.01M18 14h.01"/>',
  qr:        '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3M21 14v7M14 20h.01M17.5 20.5h.5"/>',
  card:      '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
  check:     '<path d="M4 12.5l5 5L20 6.5"/>',
  left:      '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  right:     '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back:      '<path d="M21 5H9l-6 7 6 7h12z"/><path d="M13 9.5l5 5M18 9.5l-5 5"/>',
  receipt:   '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  printer:   '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  plus:      '<path d="M12 5v14M5 12h14"/>',
  alert:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>'
};
const CATEGORY_ICONS = { All: 'all', Noodles: 'noodles', Sides: 'sides', Drinks: 'drinks' };
function icon(name, size) {
  const s = size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '';
  return '<svg ' + ICON_ATTR + s + '>' + ICONS[name] + '</svg>';
}

// ---------- Dish illustrations (inline SVG, so the kiosk needs no image files) ----------
const STEAM = '<g fill="none" stroke="#b8a291" stroke-width="3" stroke-linecap="round" opacity=".55"><path d="M54 30c-5-5 5-9 0-15"/><path d="M70 28c-5-5 5-9 0-15"/><path d="M86 30c-5-5 5-9 0-15"/></g>';
const SHADOW = '<ellipse cx="70" cy="101" rx="42" ry="5" fill="rgba(60,30,10,.14)"/>';
const EGG = '<ellipse cx="90" cy="48" rx="12" ry="8" fill="#fff"/><circle cx="90" cy="48" r="4.5" fill="#f59e0b"/>';
const SCALLION = '<g fill="#65a30d"><circle cx="68" cy="56" r="2.2"/><circle cx="76" cy="53" r="2.2"/><circle cx="60" cy="54" r="2"/><circle cx="82" cy="57" r="2"/></g>';

// One bowl shape reused by every soup dish. o = colors + toppings for that dish.
function noodleBowl(o) {
  return '<svg viewBox="0 0 140 110" aria-hidden="true">' + STEAM + SHADOW +
    '<path d="M18 54h104c0 30-22 46-52 46S18 84 18 54z" fill="' + o.bowl + '"/>' +
    '<path d="M24 70c30 10 62 10 92 0" fill="none" stroke="' + o.band + '" stroke-width="4" stroke-linecap="round"/>' +
    '<ellipse cx="70" cy="54" rx="52" ry="13" fill="' + o.rim + '"/>' +
    '<ellipse cx="70" cy="54" rx="46" ry="10" fill="' + o.broth + '"/>' +
    '<g fill="none" stroke="' + o.noodle + '" stroke-width="' + (o.thick || 3.5) + '" stroke-linecap="round">' +
    '<path d="M36 53q8-7 16 0t16 0t16 0t16 0"/><path d="M42 57q8-6 14 0t14 0t14 0t14 0"/></g>' + o.tops + '</svg>';
}

const ART = {
  tonkotsu: function () {
    return noodleBowl({ bowl: '#fffdf9', band: '#d9480f', rim: '#f1e4d3', broth: '#f4e1c1', noodle: '#f6c453',
      tops: EGG + '<circle cx="50" cy="47" r="10" fill="#e9a8a0"/><circle cx="50" cy="47" r="6.5" fill="none" stroke="#c97a73" stroke-width="2"/>' +
            '<rect x="68" y="30" width="13" height="24" rx="1.5" fill="#1f3326" transform="rotate(10 74 42)"/>' + SCALLION });
  },
  spicymiso: function () {
    return noodleBowl({ bowl: '#7f1d1d', band: '#fca5a5', rim: '#5f1414', broth: '#e0662a', noodle: '#f6c453',
      tops: EGG + '<g fill="#facc15"><circle cx="52" cy="47" r="3"/><circle cx="60" cy="50" r="3"/><circle cx="48" cy="52" r="3"/></g>' +
            '<g fill="#b91c1c"><circle cx="70" cy="48" r="1.8"/><circle cx="74" cy="52" r="1.8"/><circle cx="66" cy="53" r="1.8"/><circle cx="78" cy="48" r="1.8"/></g>' + SCALLION });
  },
  beefmami: function () {
    return noodleBowl({ bowl: '#fffdf9', band: '#2563eb', rim: '#eadfce', broth: '#e7c58a', noodle: '#f3d27a',
      tops: '<ellipse cx="52" cy="47" rx="10" ry="5.5" fill="#8b4a2b" transform="rotate(-12 52 47)"/><ellipse cx="68" cy="44" rx="10" ry="5.5" fill="#a15a36" transform="rotate(8 68 44)"/>' +
            '<path d="M88 52c-6-14 2-20 8-18 6 2 6 12-8 18z" fill="#4d7c0f"/><path d="M92 50c-2-8 0-12 3-13" fill="none" stroke="#a3e635" stroke-width="2"/>' +
            '<g fill="#c58a2b"><circle cx="76" cy="52" r="1.8"/><circle cx="82" cy="55" r="1.8"/><circle cx="60" cy="55" r="1.8"/></g>' });
  },
  udon: function () {
    return noodleBowl({ bowl: '#2f3e46', band: '#94a3b8', rim: '#1f2a30', broth: '#ead19b', noodle: '#fffaf0', thick: 6,
      tops: '<circle cx="50" cy="46" r="9" fill="#fff"/><path d="M44 46q3-5 6 0t6 0" fill="none" stroke="#f472b6" stroke-width="2.4" stroke-linecap="round"/>' +
            '<path d="M82 52c2-10 12-14 20-8-2 8-12 12-20 8z" fill="#e8a33d"/><path d="M86 50l12-6" stroke="#c97a1a" stroke-width="2" stroke-linecap="round"/>' + SCALLION });
  },
  pancit: function () {
    return '<svg viewBox="0 0 140 110" aria-hidden="true">' + STEAM + SHADOW +
      '<ellipse cx="70" cy="80" rx="58" ry="18" fill="#fff"/><ellipse cx="70" cy="78" rx="48" ry="13" fill="#f3ece4"/>' +
      '<path d="M30 76c4-30 28-40 40-40s36 10 40 40c-14 10-76 10-80 0z" fill="#d99a45"/>' +
      '<g fill="none" stroke="#b87424" stroke-width="3" stroke-linecap="round"><path d="M38 70q10-8 20 0t20 0t20 0"/><path d="M42 60q10-8 18 0t18 0t18 0"/><path d="M50 50q8-6 14 0t14 0t10 0"/></g>' +
      '<g fill="#f97316"><circle cx="56" cy="63" r="3.4"/><circle cx="88" cy="57" r="3.4"/><circle cx="76" cy="70" r="3.4"/></g>' +
      '<g fill="#65a30d"><circle cx="66" cy="54" r="2.8"/><circle cx="98" cy="66" r="2.8"/><circle cx="48" cy="72" r="2.8"/></g>' +
      '<path d="M84 44c10-4 16 4 12 12" fill="none" stroke="#fb923c" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="114" cy="86" r="9" fill="#84cc16"/><circle cx="114" cy="86" r="6" fill="#d9f99d"/></svg>';
  },
  gyoza: function () {
    const d = function (x, y) {
      return '<g transform="translate(' + x + ' ' + y + ')"><path d="M-19 7C-15-10 15-10 19 7z" fill="#f7e2b8"/>' +
        '<path d="M-18 7H18" stroke="#d99a45" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M-9-5l2 8M0-7v10M9-5l-2 8" stroke="#e1c48c" stroke-width="2" stroke-linecap="round"/></g>';
    };
    return '<svg viewBox="0 0 140 110" aria-hidden="true">' + STEAM + SHADOW +
      '<ellipse cx="66" cy="76" rx="56" ry="20" fill="#fff"/><ellipse cx="66" cy="74" rx="46" ry="15" fill="#f3ece4"/>' +
      d(44, 68) + d(88, 68) + d(66, 80) + d(66, 62) +
      '<ellipse cx="116" cy="88" rx="14" ry="6" fill="#fff"/><ellipse cx="116" cy="87" rx="10" ry="3.6" fill="#4a2a18"/></svg>';
  },
  siomai: function () {
    const s = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#f6cf6a"/><circle cx="' + x + '" cy="' + (y - 1) + '" r="2.8" fill="#f97316"/>'; };
    return '<svg viewBox="0 0 140 110" aria-hidden="true">' + STEAM + SHADOW +
      '<path d="M22 62h96v18c0 10-20 18-48 18S22 90 22 80z" fill="#d9a766"/>' +
      '<g stroke="#b98343" stroke-width="2.5" stroke-linecap="round" fill="none"><path d="M34 70c24 8 48 8 72 0"/><path d="M30 80c26 9 54 9 80 0"/></g>' +
      '<ellipse cx="70" cy="62" rx="48" ry="12" fill="#e8bf85"/><ellipse cx="70" cy="62" rx="42" ry="9" fill="#c99555"/>' +
      s(50, 60) + s(70, 56) + s(90, 60) + s(70, 65) + '</svg>';
  },
  icedtea: function () {
    return '<svg viewBox="0 0 140 110" aria-hidden="true">' + SHADOW +
      '<path d="M80 6L72 52" stroke="#d9480f" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M46 22h48l-6 76H52z" fill="rgba(255,255,255,.65)" stroke="#c9b6a3" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M49 42h42l-4.5 54H53.5z" fill="#d9822b" opacity=".92"/>' +
      '<g fill="#fff" opacity=".65"><rect x="56" y="48" width="14" height="14" rx="3" transform="rotate(-12 63 55)"/><rect x="72" y="58" width="14" height="14" rx="3" transform="rotate(10 79 65)"/><rect x="58" y="72" width="13" height="13" rx="3" transform="rotate(8 64 78)"/></g>' +
      '<circle cx="98" cy="30" r="13" fill="#facc15"/><circle cx="98" cy="30" r="9.5" fill="#fde68a"/><path d="M98 21v18M89 30h18M91.5 23.5l13 13M104.5 23.5l-13 13" stroke="#facc15" stroke-width="1.6"/></svg>';
  },
  greentea: function () {
    return '<svg viewBox="0 0 140 110" aria-hidden="true">' + STEAM + SHADOW +
      '<ellipse cx="70" cy="94" rx="46" ry="8" fill="#f3ece4"/>' +
      '<path d="M98 52h6a10 10 0 0 1 0 20h-8" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M42 44h56v22c0 18-12 28-28 28S42 84 42 66z" fill="#fff"/>' +
      '<path d="M46 70c16 8 32 8 48 0" fill="none" stroke="#65a30d" stroke-width="4" stroke-linecap="round"/>' +
      '<ellipse cx="70" cy="44" rx="28" ry="6.5" fill="#e5e7eb"/><ellipse cx="70" cy="44.5" rx="24" ry="5" fill="#8bb358"/></svg>';
  }
};
function art(id) { return ART[id] ? ART[id]() : ''; }

// ---------- Header with step pills ----------
// done = how many steps show a check mark, active = which step is white (0 = none)
const STEP_STATE = {
  order:   { done: 0, active: 1 },
  review:  { done: 1, active: 2 },
  payment: { done: 2, active: 3 },
  cash:    { done: 2, active: 3 },
  qr:      { done: 2, active: 3 },
  card:    { done: 2, active: 3 },
  success: { done: 3, active: 0 },
  receipt: { done: 3, active: 4 }
};
const STEP_NAMES = ['Order', 'Review', 'Payment', 'Receipt'];

function headerHTML() {
  const s = STEP_STATE[state.screen];
  const pills = STEP_NAMES.map((name, i) => {
    const n = i + 1;
    if (n === s.active) return '<div class="step active">' + n + ' ' + name + '</div>';
    if (n <= s.done) return '<div class="step done">✓' + name + '</div>';
    return '<div class="step">' + n + ' ' + name + '</div>';
  }).join('');
  return '<header class="header">' +
    '<div class="brand"><div class="brand-logo">' + icon('noodles') + '</div>' +
    '<div><div class="brand-name">Slurp Noodle House</div><div class="brand-sub">Self-service kiosk</div></div></div>' +
    '<div class="steps">' + pills + '</div></header>';
}

// ---------- Screen 1: Order ----------
function orderScreen() {
  const chips = CATEGORIES.map(f =>
    '<button class="cat-tab' + (state.filter === f ? ' selected' : '') + '" data-action="filter" data-value="' + f + '">' +
    '<span class="cat-icon">' + icon(CATEGORY_ICONS[f]) + '</span><span>' + f + '</span></button>'
  ).join('');

  const cards = PRODUCTS
    .filter(p => state.filter === 'All' || p.category === state.filter)
    .map(p => {
      const q = qtyOf(p.id);
      return '<button class="product-card' + (q ? ' in-order' : '') + '" data-action="add" data-id="' + p.id + '">' +
        (q ? '<div class="badge">' + q + '</div>' : '') +
        '<div class="product-art" style="background:' + p.tile + '">' + art(p.id) + '</div>' +
        '<span class="product-name">' + p.name + '</span><span class="product-price">' + peso(p.price) + '</span>' +
        '<span class="add-pill">+ Add</span></button>';
    }).join('');

  const lines = cartLines();
  const rows = lines.length === 0
    ? '<div class="order-empty">' + icon('cart') + '<strong>Your order is empty</strong><span>Tap a dish to add it to your order.</span></div>'
    : '<div class="order-rows">' + lines.map(l =>
        '<div class="order-row">' +
        '<div class="row-name">' + l.name + '</div><div class="row-each">' + peso(l.price) + ' each</div>' +
        '<button class="trash-btn" data-action="remove" data-id="' + l.id + '" aria-label="Remove ' + l.name + '">' + icon('trash') + '</button>' +
        '<div class="row-bottom"><div class="qty">' +
        '<button class="qty-btn" data-action="minus" data-id="' + l.id + '" aria-label="Decrease">–</button>' +
        '<span class="qty-num">' + l.qty + '</span>' +
        '<button class="qty-btn plus" data-action="plus" data-id="' + l.id + '" aria-label="Increase">+</button></div>' +
        '<div class="row-subtotal">' + peso(l.subtotal) + '</div></div></div>'
      ).join('') + '</div>';

  return '<main class="screen order-layout">' +
    '<section class="products-area"><div class="cat-row">' + chips + '</div>' +
    '<div class="section-head"><h1>' + (state.filter === 'All' ? 'All Items' : state.filter) + '</h1><span>Tap a dish to add it</span></div>' +
    '<div class="product-grid">' + cards + '</div></section>' +
    '<aside class="order-panel"><div class="panel-head"><h2>Your Order</h2><span>' + itemsLabel(itemCount()) + '</span></div>' +
    rows +
    '<div class="panel-foot"><div class="total-line"><span class="label">Total</span><span class="amount">' + peso(cartTotal()) + '</span></div>' +
    '<button class="btn btn-primary" data-action="go" data-screen="review"' + (lines.length ? '' : ' disabled') + '>Proceed to Payment ' + icon('right') + '</button></div></aside></main>';
}

// ---------- Screen 2: Review ----------
function reviewScreen() {
  const rows = cartLines().map(l =>
    '<div class="table-row"><div class="name">' + l.name + '</div><div class="qty-cell">' + l.qty + '</div>' +
    '<div class="unit">' + peso(l.price) + '</div><div class="subtotal">' + peso(l.subtotal) + '</div></div>'
  ).join('');
  return '<main class="screen"><div class="review-wrap">' +
    '<h1>Review your order</h1><p class="sub">Check your items before paying. Tap Back to make changes — your items stay in the cart.</p>' +
    '<div class="card table-card"><div class="table-head"><div>PRODUCT</div><div>QUANTITY</div><div>UNIT PRICE</div><div>SUBTOTAL</div></div>' +
    rows + '<div class="table-space"></div>' +
    '<div class="table-foot"><div><div class="t1">Total Amount</div><div class="t2">' + itemsLabel(itemCount()) + '</div></div><div class="big">' + peso(cartTotal()) + '</div></div></div>' +
    '<div class="button-row"><button class="btn btn-secondary" data-action="go" data-screen="order">' + icon('left') + ' Back</button>' +
    '<button class="btn btn-primary" data-action="go" data-screen="payment">Continue to Payment ' + icon('right') + '</button></div>' +
    '</div></main>';
}

// ---------- Screen 3: Payment method ----------
function paymentScreen() {
  const methods = [
    { screen: 'cash', title: 'Cash', text: 'Enter the amount you are paying. Change is computed for you.', ic: 'cash', fg: '#166534', bg: '#dcfce7' },
    { screen: 'qr', title: 'QR Payment', text: 'Scan with a supported e-wallet or banking app.', ic: 'qr', fg: '#1d4ed8', bg: '#dbeafe' },
    { screen: 'card', title: 'Credit / Debit Card', text: 'Tap, insert, or swipe your card at the reader.', ic: 'card', fg: '#6d28d9', bg: '#ede9fe' }
  ].map(m =>
    '<button class="method-card" data-action="go" data-screen="' + m.screen + '">' +
    '<div class="method-icon" style="background:' + m.bg + ';color:' + m.fg + '">' + icon(m.ic) + '</div>' +
    '<h2>' + m.title + '</h2><p>' + m.text + '</p></button>'
  ).join('');
  return '<main class="screen"><div class="pay-wrap">' +
    '<div class="pay-head"><div><h1>How would you like to pay?</h1><p class="sub">Tap one of the options below.</p></div>' +
    '<div class="card due-card"><div class="l">AMOUNT DUE</div><div class="v">' + peso(cartTotal()) + '</div></div></div>' +
    '<div class="method-grid">' + methods + '</div>' +
    '<button class="btn btn-secondary" data-action="go" data-screen="order">' + icon('left') + ' Back to Order</button>' +
    '</div></main>';
}

// ---------- Screen 4: Cash ----------
function cashScreen() {
  const total = cartTotal();
  const paid = paidAmount();
  const enough = paid >= total;
  const err = state.cashError;
  const alertBox = err
    ? '<div class="alert-box" role="alert">' + icon('alert') + '<div><strong>' + err.title + '</strong><span>' + err.text + '</span></div></div>'
    : '';
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => '<button class="key" data-action="key" data-value="' + k + '">' + k + '</button>').join('');
  const quick = [['exact', 'Exact'], ['200', '₱200'], ['500', '₱500'], ['1000', '₱1,000']].map(q =>
    '<button class="quick-btn' + (state.quick === q[0] ? ' selected' : '') + '" data-action="quick" data-value="' + q[0] + '">' + q[1] + '</button>'
  ).join('');
  return '<main class="screen cash-layout"><section>' +
    '<div class="title-line"><div class="title-icon" style="background:#dcfce7;color:#166534">' + icon('cash') + '</div><h1>Cash Payment</h1></div>' +
    '<div class="card amount-card"><span class="l">Total amount</span><span class="v">' + peso(total) + '</span></div>' +
    '<div class="field-label">Amount paid</div><div class="amount-input' + (err ? ' error' : '') + '">' + peso(paid) + '</div>' + alertBox +
    '<div class="quick-label">Quick amounts</div><div class="quick-row">' + quick + '</div>' +
    '<div class="change-box"><div><div class="t1">Change</div><div class="t2">' + peso(paid) + ' – ' + peso(total) + '</div></div><div class="v">' + (enough ? peso(paid - total) : '—') + '</div></div>' +
    '</section><section class="keypad-area"><div class="keypad">' + keys +
    '<button class="key muted" data-action="clear">Clear</button><button class="key" data-action="key" data-value="0">0</button>' +
    '<button class="key muted" data-action="backspace" aria-label="Backspace">' + icon('back') + '</button></div>' +
    '<button class="btn btn-primary" data-action="paycash">Pay Now</button>' +
    '<button class="btn btn-secondary" data-action="go" data-screen="payment">' + icon('left') + ' Change payment method</button>' +
    '</section></main>';
}

// ---------- Screen 7: QR ----------
function qrScreen() {
  const total = peso(cartTotal());
  return '<main class="screen split-layout"><section>' +
    '<div class="card visual-card"><div><div class="qr-box"><div class="qr-corner tl"></div><div class="qr-corner tr"></div><div class="qr-corner bl"></div>' +
    '<div class="qr-label">QR CODE<small>placeholder</small></div></div><div class="qr-ref">Ref: ' + reference('QR-TXN') + '</div></div></div></section>' +
    '<section class="info-side"><div class="title-line"><div class="title-icon" style="background:#dbeafe;color:#1d4ed8">' + icon('qr') + '</div><h1>QR Payment</h1></div>' +
    '<div class="card amount-card"><span class="l">Amount to pay</span><span class="v">' + total + '</span></div>' +
    '<ol class="qr-steps"><li><span class="n">1</span>Scan the QR code using your supported payment application.</li>' +
    '<li><span class="n">2</span>Check that the amount is ' + total + ' and approve it in your app.</li>' +
    '<li><span class="n">3</span>Tap Confirm Payment below.</li></ol>' +
    '<div class="button-row"><button class="btn btn-secondary" data-action="go" data-screen="payment">' + icon('left') + ' Back</button>' +
    '<button class="btn btn-primary" data-action="payqr">' + icon('check') + ' Confirm Payment</button></div>' +
    '<p class="note">Simulated payment — the amount paid will equal the total, with ₱0.00 change.</p></section></main>';
}

// ---------- Screen 8: Card ----------
function cardReaderSVG() {
  return '<svg class="reader-svg" viewBox="0 0 390 380">' +
    '<rect x="40" y="40" width="230" height="340" rx="36" fill="#1e293b"/>' +
    '<rect x="62" y="62" width="186" height="120" rx="14" fill="#0f172a"/>' +
    '<text x="76" y="92" fill="#7dd3fc" font-size="13" font-family="monospace">PROCESSING</text>' +
    '<text x="76" y="128" fill="#fff" font-size="28" font-weight="800" font-family="sans-serif">' + peso(cartTotal()) + '</text>' +
    '<g fill="none" stroke="#7dd3fc" stroke-width="5" stroke-linecap="round"><path d="M148 215q12 20 0 40"/><path d="M162 205q20 30 0 60"/><path d="M176 195q28 40 0 80"/></g>' +
    '<rect x="100" y="345" width="110" height="12" rx="6" fill="#0f172a"/>' +
    '<g transform="translate(50 62) rotate(-12 220 130)"><rect x="140" y="70" width="170" height="110" rx="16" fill="#5b21b6"/>' +
    '<rect x="158" y="92" width="38" height="28" rx="6" fill="#facc15"/>' +
    '<text x="158" y="150" fill="#ddd6fe" font-size="14" font-family="monospace">•••• •••• ••••</text>' +
    '<text x="158" y="170" fill="#ddd6fe" font-size="13" font-family="monospace">4821</text></g></svg>';
}
function cardScreen() {
  return '<main class="screen split-layout"><section>' +
    '<div class="card visual-card tall">' + cardReaderSVG() + '</div></section>' +
    '<section class="info-side"><div class="title-line"><div class="title-icon" style="background:#ede9fe;color:#6d28d9">' + icon('card') + '</div><h1>Credit / Debit Card</h1></div>' +
    '<div class="card amount-card"><span class="l">Amount due</span><span class="v">' + peso(cartTotal()) + '</span></div>' +
    '<div class="instruction">Please tap, insert, or swipe your card.</div>' +
    '<div class="processing"><div class="top"><div class="spinner"></div>Processing payment…</div>' +
    '<div class="progress"><div' + (state.processing ? ' class="running"' : '') + '></div></div><div class="warn">Do not remove your card until the payment is complete.</div></div>' +
    '<div class="button-row"><button class="btn btn-secondary" data-action="go" data-screen="payment"' + (state.processing ? ' disabled' : '') + '>' + icon('left') + ' Back</button>' +
    '<button class="btn btn-primary" data-action="paycard"' + (state.processing ? ' disabled' : '') + '>Process Payment</button></div></section></main>';
}

// ---------- Screen 5: Payment successful ----------
function successScreen() {
  const t = state.transaction;
  return '<main class="screen center-wrap"><div class="card success-card">' +
    '<div class="success-icon">' + icon('check') + '</div><h1>Payment Successful</h1>' +
    '<p class="sub">Transaction completed successfully. Thank you!</p>' +
    '<div class="details">' +
    '<div class="detail-row"><span>Transaction No.</span><span class="v mono">' + t.txn + '</span></div>' +
    '<div class="detail-row"><span>Payment method</span><span class="v">' + t.method + '</span></div>' +
    '<div class="detail-row"><span>Transaction amount</span><span class="v">' + peso(t.total) + '</span></div>' +
    '<div class="detail-row"><span>Amount paid</span><span class="v">' + peso(t.paid) + '</span></div>' +
    '<div class="detail-row"><span>Change</span><span class="v green">' + peso(t.change) + '</span></div></div>' +
    '<button class="btn btn-primary" data-action="go" data-screen="receipt">' + icon('receipt') + ' View Receipt</button></div></main>';
}

// ---------- Screen 6: Receipt ----------
function receiptScreen() {
  const t = state.transaction;
  const items = t.lines.map(l =>
    '<div class="r-item"><div class="n"><span>' + l.name + '</span><span>' + peso(l.subtotal) + '</span></div>' +
    '<div class="d">' + l.qty + ' × ' + peso(l.price) + '</div></div>'
  ).join('');
  return '<main class="screen receipt-layout"><div class="receipt-paper">' +
    '<div class="title">SLURP NOODLE HOUSE</div><div class="sub-title">Self-Service Kiosk · Official Digital Receipt</div><div class="dash"></div>' +
    '<div class="r-line"><span>Transaction No.</span><strong>' + t.txn + '</strong></div>' +
    '<div class="r-line"><span>Date</span><span>' + formatDate(t.date) + '</span></div><div class="dash"></div>' +
    '<div class="r-line r-head"><span>ITEM</span><span>SUBTOTAL</span></div>' + items + '<div class="dash"></div>' +
    '<div class="r-line r-total"><span>TOTAL</span><span>' + peso(t.total) + '</span></div>' +
    '<div class="r-line"><span>Payment method</span><span>' + t.method + '</span></div>' +
    '<div class="r-line"><span>Amount paid</span><span>' + peso(t.paid) + '</span></div>' +
    '<div class="r-line"><span>Change</span><span>' + peso(t.change) + '</span></div>' +
    '<div class="r-line"><span>Status</span><span class="r-status">Payment Successful</span></div>' +
    '<div class="spacer"></div><div class="dash"></div><div class="thanks">Thank you for your purchase!</div></div>' +
    '<div class="receipt-actions"><h1>Your receipt</h1>' +
    '<p class="sub">Keep this for your records. Tap New Transaction when you are done — your order and payment details will be cleared.</p>' +
    '<button class="btn btn-primary" data-action="newtxn">' + icon('plus') + ' New Transaction</button>' +
    '<button class="btn btn-secondary" data-action="print">' + icon('printer') + ' Print Receipt</button>' +
    '<p class="note">Printing is optional — the digital receipt is your proof of payment.</p></div></main>';
}

// ---------- Render + click handling ----------
const SCREENS = {
  order: orderScreen, review: reviewScreen, payment: paymentScreen, cash: cashScreen,
  qr: qrScreen, card: cardScreen, success: successScreen, receipt: receiptScreen
};

let lastScreen = null;
function render() {
  // The product grid, the order list and (on small tablets) the screen itself can scroll.
  // Remember where each one was so tapping "+ Add" never throws the customer back to the top.
  const keep = ['.order-rows', '.product-grid', '.screen'];
  const saved = keep.map(sel => { const el = document.querySelector(sel); return el ? el.scrollTop : 0; });
  document.getElementById('app').innerHTML = headerHTML() + SCREENS[state.screen]();
  keep.forEach((sel, i) => {
    if (sel === '.screen' && lastScreen !== state.screen) return;   // new screen starts at the top
    const el = document.querySelector(sel);
    if (el) el.scrollTop = saved[i];
  });
  lastScreen = state.screen;
}

// One click listener for the whole app. Each button has a data-action.
document.getElementById('app').addEventListener('click', function (e) {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.disabled) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === 'go') goTo(btn.dataset.screen);
  else if (action === 'filter') {
    state.filter = btn.dataset.value; render();
    const grid = document.querySelector('.product-grid'); if (grid) grid.scrollTop = 0;
  }
  else if (action === 'add') addToCart(id);
  else if (action === 'plus') changeQty(id, 1);
  else if (action === 'minus') changeQty(id, -1);
  else if (action === 'remove') removeFromCart(id);
  else if (action === 'key') pressKey(btn.dataset.value);
  else if (action === 'quick') pickQuick(btn.dataset.value);
  else if (action === 'clear') { resetCash(); render(); }
  else if (action === 'backspace') backspace();
  else if (action === 'paycash') payCash();
  else if (action === 'payqr') payQR();
  else if (action === 'paycard') payCard();
  else if (action === 'newtxn') newTransaction();
  else if (action === 'print') window.print();
});

render();
