// icons.js - simple line icons (24x24 SVG).

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
