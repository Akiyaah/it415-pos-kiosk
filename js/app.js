// app.js - draws the current screen and handles every tap. Runs last (see index.html).

// Which screen function draws each state.screen value.
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

function setFilter(value) {
  state.filter = value;
  render();
  const grid = document.querySelector('.product-grid');
  if (grid) grid.scrollTop = 0;
}

// Every button has data-action="name". This table says what each name does.
// btn = the tapped button, so handlers can read btn.dataset.id / .value / .screen.
const ACTIONS = {
  go:        btn => goTo(btn.dataset.screen),
  filter:    btn => setFilter(btn.dataset.value),
  add:       btn => addToCart(btn.dataset.id),
  plus:      btn => changeQty(btn.dataset.id, 1),
  minus:     btn => changeQty(btn.dataset.id, -1),
  remove:    btn => removeFromCart(btn.dataset.id),
  key:       btn => pressKey(btn.dataset.value),
  quick:     btn => pickQuick(btn.dataset.value),
  clear:     ()  => { resetCash(); render(); },
  backspace: ()  => backspace(),
  paycash:   ()  => payCash(),
  payqr:     ()  => payQR(),
  paycard:   ()  => payCard(),
  newtxn:    ()  => newTransaction(),
  print:     ()  => window.print()
};

// One click listener for the whole app.
document.getElementById('app').addEventListener('click', function (e) {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.disabled) return;
  const handler = ACTIONS[btn.dataset.action];
  if (handler) handler(btn);
});

render();
