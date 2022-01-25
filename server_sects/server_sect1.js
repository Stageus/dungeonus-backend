const express = require("express");
const app = express();

const main = require("../router/main.js");
app.use("/main", main);

// const account = require("../router/account.js");
// app.use("/account", account);

module.exports = app;