//constants
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

//settings

require("dotenv").config();

app.use(cors());

app.use(express.json());

//database connection + start server
app.get("/", (req, res) => {
  res.send("<h1>Welcome To This Server!!</h1>");
});

const pool = require("./db");

async function getPgVersion() {
  try {
    const result = await pool`select * from vendor`;
    app.listen(process.env.PORT, () => {
      console.log("Welcome to mehdi empire");
    });
  } catch (err) {
    throw new Error(err);
  }
}

getPgVersion();

//routes
const userRouter = require("./routes/user.route");
const vendorRouter = require("./routes/vendor.route");
const allUsersRouter = require('./routes/all.users.route');
const decodeRouter = require('./routes/decode.route');

app.use("/api/users", userRouter);
app.use("/api/vendors", vendorRouter);
app.use("/api/all",allUsersRouter);
app.use("/api/decode",decodeRouter);

//error handeler
app.use((err, req, res, next) => {
  res.json({
    status: err.status || "error",
    code: err.code || 500,
    message: err.message,
  });
});

//404 page
app.use("*", (req, res) => {
  res.status(404).json({ message: "route not found" });
});
