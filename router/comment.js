const express = require("express");
const router = express.Router(); 
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const url = require("url");
const querystring = require('querystring');
const mongoLogDAO = require("../module/mongoLogDAO");
const apiType = require("../module/apiTypeInfo");

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
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.comment.read_comment, 
        JSON.stringify(postingIndex), JSON.stringify(resultFormat));
    })
    .catch (err => {
        resultFormat.errmsg = err
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.comment.read_comment, 
        JSON.stringify(postingIndex), JSON.stringify(resultFormat));
    })


}) 

router.post("/", (req, res) => {
    const reqId = req.body.id  //API 요청한 사람의 아이디
    const reqContent = req.body.content 
    const reqBoardIndex = req.body.boardIndex
    const reqPostingIndex = req.body.postingIndex

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    };
    //TODO: 사용자 정보가 있는지 확인 > reqId를 login 테이블에서 확인 
    //TODO: 댓글이 달릴 포스팅이 실제 존재하는지 확인하는 코드?
    //TODO: 입력값이 sql 데이터 타입에 맞는지 검사하는 코드?

    dao.insertComment(reqId, reqContent, reqBoardIndex, reqPostingIndex)
    .then(res_ins => {
        resultFormat.success = true;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.comment.create_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.comment.create_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    });
})

router.put("/", (req, res) => {
    const reqId = req.body.id; //API 요청한 사람의 아이디 
    const reqContent = req.body.newContent;
    const reqcommentIndex = req.body.commentIndex;

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    }
    //TODO: 사용자 정보가 있는지 확인 > reqId를 login 테이블에서 확인 
    //TODO: 댓글이 달릴 포스팅이 실제 존재하는지 확인하는 코드?
    //TODO: 댓글 작성자와 수정 요청자가 맞는지 확인
    dao.selectWithCommentIndex(DBUtil.commentTable, reqcommentIndex)
    .then(res_sel=> {
        console.log(res_sel.rows)
        if (res_sel.rows[0].id != reqId) {
            resultFormat.errmsg = "you are not a comment writer, wrong ID"
            res.send(resultFormat);
            mongoLogDAO.sendLog("", apiType.comment.update_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
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
                mongoLogDAO.sendLog("", apiType.comment.update_comment, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            })
            .catch(e=> {
                resultFormat.errmsg = e;
                res.send(resultFormat);
                mongoLogDAO.sendLog("", apiType.comment.update_comment, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            })
        }
    })
    .catch (err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
    })
})

router.delete("/", (req, res) => {
    const reqIndex = req.body.commentIndex;
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
    };

    //TODO: 사용자 정보가 있는지 확인 > reqId를 login 테이블에서 확인 
    //TODO: 댓글 작성자와 삭제 요청자가 맞는지 확인 
    dao.deleteComment(reqIndex)
    .then(res_del => {
        resultFormat.success = true;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.comment.delete_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.comment.delete_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
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
        mongoLogDAO.sendLog("", apiType.comment.total_comment, 
        "", JSON.stringify(resultFormat));
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.comment.total_comment, 
        "", JSON.stringify(resultFormat));
    })
})

module.exports = router;