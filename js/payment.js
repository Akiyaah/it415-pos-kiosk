// payment.js - validation, the three payment methods, creating the transaction, navigation.

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
