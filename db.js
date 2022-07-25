/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql://biztimedb_test";
} else {
  DB_URI = "postgresql:///biztimedb";
}

let db = new Client({
  connectionString: DB_URI
});

Client.connect();

module.exports = db;
