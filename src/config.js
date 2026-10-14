const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.');
}

module.exports = {
  mongoUri,
  port: Number(process.env.PORT || 3000),
};
