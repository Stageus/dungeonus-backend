const express = require("express");
const app = express();

const main = require("../router/main.js");
app.use("/main", main);

module.exports = app;