const mysql = require('mysql');

module.exports = () => {
  return mysql.createConnection({
    host: 'us-cdbr-iron-east-01.cleardb.net',
    user: "b1d70906bb051b",
    password: "ce0d0ee6",
    database : 'heroku_02e2090c5af5a0f'
  })
};
