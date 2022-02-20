const express = require("express");
const router = express.Router(); 
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const url = require("url");
const querystring = require('querystring');

router.get("/", (req, res) => {
}) 

router.post("/", (req, res) => {
    const reqId = req.body.id 
    const reqContent = req.body.content 
    const reqBoardIndex = parseInt(req.body.boardIndex)
    const reqPostingIndex = parseInt(req.body.postingIndex)

    const resultFormat = {
        "success" : false,
        "errmsg" : "none"
    };

    dao.insertComment(reqId, reqContent, reqBoardIndex, reqPostingIndex)
    .then(res => {
        resultFormat.success = true;
        res.send(resultFormat);
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
    });
})

router.put("/", (req, res) => {
})

router.delete("/", (req, res) => {
    const reqIndex = req.body.commentIndex;
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
    };
    // 글 작성자가 맞는지 확인하는 과정 추가 

    dao.deleteComment(reqIndex)
    .then(res => {
        resultFormat.success = true;
        res.send(resultFormat);
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
    })
})

router.get("/total", (req, res) => {
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "comment_list" : [],
    };

    dao.selectAllPostings(DBUtil.commentTable)
    .then( res => {
        if(res.rows.length == 0) {
            resultFormat.errmsg = "there is no comments"
        } else {
            resultFormat.success = true;
            resultFormat.comment = res.rows;
        }
        res.send(resultFormat);
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
    })
})

module.exports = router;