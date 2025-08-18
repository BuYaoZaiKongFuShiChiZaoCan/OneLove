const serverless = require('serverless-http');
const app = require('../../OneLove-backend/app');

module.exports.handler = serverless(app);

