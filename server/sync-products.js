/* Regenerates server/data/products.json from the frontend's
   js/products-data.js — run this any time you add/edit products
   there, so the backend prices/order validation stay in sync.

   Usage (from the server/ folder):  npm run sync-products
*/
'use strict';

const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', 'js', 'products-data.js');
const DEST = path.join(__dirname, 'data', 'products.json');

const code = fs.readFileSync(SOURCE, 'utf8').replace("'use strict';", '');
const mod = { exports: {} };
new Function('module', 'exports', code + '\nmodule.exports = ORGANIC_ILAJ_PRODUCTS;')(mod, mod.exports);

fs.writeFileSync(DEST, JSON.stringify(mod.exports, null, 2));
console.log(`Synced ${mod.exports.length} products to ${DEST}`);
