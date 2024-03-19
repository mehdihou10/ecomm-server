const postgres = require("postgres");

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const pool = postgres({
  //   host: PGHOST,
  //   database: PGDATABASE,
  //   username: PGUSER,
  //   password: PGPASSWORD,
  //   port: 5432,
  //   ssl: 'require',
  //   connection: {
  //     options: `project=${ENDPOINT_ID}`,
  //   
//   host: PGHOST,
//   database: PGDATABASE,
//   username: PGUSER,
//   password: PGPASSWORD,
//   port: 5432,
//   ssl: 'require',
//   connection: {
//     options: `project=${ENDPOINT_ID}`,
//   },


  host: "localhost",
  user: "postgres",
  password: process.env.PASSWORD,
  database: process.env.DB,
});

module.exports = pool;
