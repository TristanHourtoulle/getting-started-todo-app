// eslint-disable-next-line @typescript-eslint/no-var-requires
if (process.env.MYSQL_HOST) module.exports = require('./mysql');
else module.exports = require('./sqlite');
