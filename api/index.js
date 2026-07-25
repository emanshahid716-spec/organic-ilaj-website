// Vercel serverless function entry point.
// Vercel calls this file for any request matched by vercel.json's
// rewrite rule. It simply re-exports the existing Express app —
// Vercel's Node.js runtime knows how to handle an Express app
// directly (it behaves like a (req, res) handler).
module.exports = require('../server/server');
