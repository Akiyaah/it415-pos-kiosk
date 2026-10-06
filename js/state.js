// state.js - the kiosk's shared data: constants, the state object, transaction numbers.
// Load order (see index.html): products, state, helpers, icons, art, cart, cash, payment, views, app.

// ---------- State ----------
const STORAGE_KEY = 'slurpNoodleNextTxn';   // remembers the next transaction number
const MAX_QTY = 99;                         // largest quantity for one item
const MAX_PAID_DIGITS = 6;                  // most digits typed on the keypad
const MAX_PAID = 999999;                    // largest cash amount in total

const state = {
  screen: 'order',      // order | review | payment | cash | qr | card | success | receipt
  filter: 'All',        // one of CATEGORIES (All | Noodles | Sides | Drinks)
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
