const express = require("express");
const router = express.Router(); 
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const url = require("url");
const querystring = require('querystring');

router.get("/", (req, res) => {
    const postingIndex = req.query.index;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting": {}
    }

    dao.selectCommentsWithPostingIndex(DBUtil.postingTable, postingIndex)
    .then(res_sel => {
        if (res_sel.rows.length == 0) {
            resultFormat.errmsg = "there is no comment having this posting index"
        } else {
            resultFormat.success = true
            resultFormat.posting = res_sel.rows
        }
        res.send(resultFormat)
    })
    .catch (err => {
        resultFormat.errmsg = err
        res.send(resultFormat)
    })


}) 

router.post("/", (req, res) => {
    const reqId = req.body.id 
    const reqContent = req.body.content 
    const reqBoardIndex = req.body.boardIndex
    const reqPostingIndex = req.body.postingIndex

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    };
    //포스팅이 존재하는지 확인하는 코드? 
    //입력값이 sql 기준에 맞는지 검사하는 코드?

    dao.insertComment(reqId, reqContent, reqBoardIndex, reqPostingIndex)
    .then(res_ins => {
        resultFormat.success = true;
        res.send(resultFormat);
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
    });
})

router.put("/", (req, res) => {
    const reqId = req.body.id;
    const reqContent = req.body.newContent;
    const reqcommentIndex = req.body.commentIndex;

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    }

    dao.selectWithCommentIndex(DBUtil.commentTable, reqcommentIndex)
    .then(res_sel=> {
        console.log(res_sel.rows)
        if (res_sel.rows[0].id != reqId) {
            resultFormat.errmsg = "you are not a comment writer, wrong ID"
            res.send(resultFormat);
        } else {
            dao.updateCommentWithIndex(reqContent, reqcommentIndex)
            .then(res_upd=>{
                if(res_upd.rowCount == 0){
                    resultFormat.errmsg = "problems occured while updating";
                }
                else{
                    resultFormat.success = true;
                }
                res.send(resultFormat);
            })
            .catch(e=> {
                resultFormat.errmsg = e;
                res.send(resultFormat);
            })
        }
    })
    .catch (err => {
        resultFormat.errmsg = err
        res.send(resultFormat)
    })
})

router.delete("/", (req, res) => {
    const reqIndex = req.body.commentIndex;
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
    };


    dao.deleteComment(reqIndex)
    .then(res_del => {
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

    dao.selectAllComments(DBUtil.commentTable)
    .then(res_selAll => {
        if(res_selAll.rows.length == 0) {
            resultFormat.errmsg = "there is no comments"
        } else {
            resultFormat.success = true;
            resultFormat.comment_list = res_selAll.rows;
        }
        res_selAll.send(resultFormat);
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
    })
})

module.exports = router;