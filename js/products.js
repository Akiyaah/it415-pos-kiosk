// Hard-coded product data for the noodle shop. Prices are in pesos (₱).
// "category" is used by the All / Noodles / Sides / Drinks tabs.
// "tile" is the soft background color behind each dish illustration.
// The illustration itself is drawn in js/app.js (function art) using the product "id".
const CATEGORIES = ['All', 'Noodles', 'Sides', 'Drinks'];

const PRODUCTS = [
  { id: 'tonkotsu',  name: 'Tonkotsu Ramen',   price: 180, category: 'Noodles', tile: '#fff1de' },
  { id: 'spicymiso', name: 'Spicy Miso Ramen', price: 190, category: 'Noodles', tile: '#ffe4dc' },
  { id: 'beefmami',  name: 'Beef Mami',        price: 120, category: 'Noodles', tile: '#fdf0cf' },
  { id: 'pancit',    name: 'Pancit Canton',    price: 85,  category: 'Noodles', tile: '#fde8c8' },
  { id: 'udon',      name: 'Udon Soup',        price: 160, category: 'Noodles', tile: '#e8eef0' },
  { id: 'gyoza',     name: 'Gyoza (5 pcs)',    price: 90,  category: 'Sides',   tile: '#f4ece3' },
  { id: 'siomai',    name: 'Siomai (4 pcs)',   price: 55,  category: 'Sides',   tile: '#fcf0d4' },
  { id: 'icedtea',   name: 'Iced Tea',         price: 35,  category: 'Drinks',  tile: '#ffe9d2' },
  { id: 'greentea',  name: 'Hot Green Tea',    price: 40,  category: 'Drinks',  tile: '#e9f3dc' }
];
