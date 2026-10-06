// art.js - inline SVG dish illustrations, so the kiosk needs no image files.

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
