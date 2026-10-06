// cash.js - the cash keypad and quick amounts.
//
// The amount paid is EITHER the quick amounts tapped (they add up: ₱200 + ₱500 = ₱700)
// OR the digits typed on the keypad. Switching from one to the other starts a fresh amount,
// so tapping ₱200 and then typing 5 gives ₱5, never ₱2,005.
function clearQuickAmounts() {
  state.quickSum = 0; state.quickCount = 0; state.quickKey = null;
}
function resetCash() {
  clearQuickAmounts();
  state.paidText = ''; state.typedText = ''; state.quick = null; state.cashError = null;
}
// Rebuilds paidText (the amount shown and validated) from the quick amounts or the typed digits.
function syncPaid() {
  const hasAny = state.quickCount > 0 || state.typedText !== '';
  state.paidText = hasAny ? String(state.quickSum + Number(state.typedText || 0)) : '';
  // Only highlight a quick button while it is the whole amount (a single tap, nothing typed).
  state.quick = (state.quickCount === 1 && state.typedText === '') ? state.quickKey : null;
}
function pressKey(digit) {
  if (state.quickCount > 0) { clearQuickAmounts(); state.typedText = ''; }   // typing starts fresh
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
  if (key === 'exact' || state.quickKey === 'exact' || state.typedText !== '') { clearQuickAmounts(); state.typedText = ''; }
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
  else clearQuickAmounts();   // nothing typed: undo the quick amounts
  state.cashError = null;
  syncPaid();
  render();
}
