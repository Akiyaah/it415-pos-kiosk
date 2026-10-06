// views.js - one function per screen. Each returns an HTML string; no logic besides display.

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
