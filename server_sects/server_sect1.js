const express = require("express");
const app = express();

const test = require("../server_sects/sect1_test/testHtml");
app.use("/test", test);

const account = require("../router/account.js");
app.use("/account", account);

module.exports = app;