const express = require("express");
const app = express();

const gethtml = require("../server_sects/sect2_test/getboardhtml");
app.use("/gethtml", gethtml);

const board = require("../router/board.js");
app.use("/board", board);

const comment = require("../router/comment.js");
app.use("/comment", comment);

const search = require("../router/search.js");
app.use("/search", search)

module.exports = app;