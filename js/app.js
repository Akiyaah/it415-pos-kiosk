// Campus Store Kiosk - Stage 1 (setup): base state only, no screens yet.

// All app data lives in one state object so it is easy to explain and reset.
const state = {
  screen: 'order',      // order | review | payment | cash | qr | card | success | receipt
  filter: 'All',        // All | Drinks | Food | Snacks
  cart: [],             // [{ id, qty }]
  transaction: null     // filled in only after a successful payment
};

// Format a number as pesos with two decimals, e.g. 45 -> ₱45.00
function peso(amount) {
  return '₱' + amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function render() {
  document.getElementById('app').textContent = 'Campus Store Kiosk - setup complete';
}

render();
