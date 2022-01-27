const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", (req,res) =>{
    res.sendFile(path.join(__dirname, "../server_sects/sect1_test/test.html"));
});

module.exports = router;