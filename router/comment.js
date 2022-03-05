const express = require("express");
const router = express.Router(); 
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const mongoLogDAO = require("../module/mongoLogDAO");
const apiType = require("../module/apiTypeInfo");

router.get("/", async(req, res) => {
    const postingIndex = req.query.index;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting": {}
    }

    try {
        const res_sel = await dao.selectCommentsWithPostingIndex(DBUtil.commentTable, postingIndex)
        if (res_sel.rows.length == 0) {
            resultFormat.errmsg = "there is no comment having this posting index"
        } else {
            resultFormat.success = true
            resultFormat.posting = res_sel.rows
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.comment.read_comment, 
        JSON.stringify(postingIndex), JSON.stringify(resultFormat));
    } catch (e) {
        console.log("error point : get router in comment API")
        console.log(e)
    }
}) 

router.post("/", async(req, res) => {
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }

    const reqId = req.body.id  //API 요청한 사람의 아이디
    const reqContent = req.body.content 
    const reqBoardIndex = req.body.boardIndex
    const reqPostingIndex = req.body.postingIndex

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    }; 
    //TODO: 댓글이 달릴 포스팅이 실제 존재하는지 확인하는 코드?
    //TODO: 입력값이 sql 데이터 타입에 맞는지 검사하는 코드?
    try {
        const res_sel_l = await dao.selectWithId(DBUtil.loginTable, reqId)
        if (res_sel_l.rows.length == 0) {
            resultFormat.errmsg = "no login information having this Id"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.post_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_sel_p = await dao.selectWithPostingIndex(DBUtil.postingTable, reqPostingIndex)
        if (res_sel_p.rows.length == 0) {
            resultFormat.errmsg = "no posting having this posting index"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.post_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        } 
        const res_ins = await dao.insertComment(reqId, reqContent, reqBoardIndex, reqPostingIndex)
        resultFormat.success = true;
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.comment.post_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    } catch (e) {
        console.log("error point : post router in comment API")
        console.log(e)
    }
})

router.put("/", async(req, res) => {
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }

    const reqId = req.body.id; //API 요청한 사람의 아이디 
    const reqContent = req.body.newContent;
    const reqCommentIndex = req.body.commentIndex;
    const reqPostingIndex = req.body.postingIndex

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    }
    try {
        const res_sel_l = await dao.selectWithId(DBUtil.loginTable, reqId)
        if (res_sel_l.rows.length == 0) {
            resultFormat.errmsg = "no login information having this Id"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.put_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_sel_p = await dao.selectWithPostingIndex(DBUtil.postingTable, reqPostingIndex)
        if (res_sel_p.rows.length == 0) {
            resultFormat.errmsg = "no comments having this Id"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.delete_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_sel_c = await dao.selectWithCommentIndex(DBUtil.commentTable, reqCommentIndex)
        if (res_sel_c.rows[0].id != reqId) {
            resultFormat.errmsg = "you are not a comment writer, wrong ID"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.delete_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_upd = await dao.updateCommentWithIndex(reqContent, reqCommentIndex)
        if(res_upd.rowCount == 0){
            resultFormat.errmsg = "problems occured while updating";
        }
        else{
            resultFormat.success = true;
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.comment.update_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
        return
    } catch (e) {
        console.log("error point : put router in comment API")
        console.log(e)
    }
})

router.delete("/", async(req, res) => {
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }
    const reqId = req.body.id; //API 요청한 사람의 아이디
    const reqPostingIndex = req.body.postingIndex;
    const reqCommentIndex = req.body.commentIndex;
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
    };

    try {
        const res_sel_l = await dao.selectWithId(DBUtil.loginTable, reqId)
        if (res_sel_l.rows.length == 0) {
            resultFormat.errmsg = "no login information having this Id"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.delete_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_sel_p = await dao.selectWithPostingIndex(DBUtil.postingTable, reqPostingIndex)
        if (res_sel_p.rows.length == 0) {
            resultFormat.errmsg = "no comments having this Id"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.delete_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_sel_c = await dao.selectWithCommentIndex(DBUtil.commentTable, reqCommentIndex)
        if (res_sel_c.rows[0].id != reqId) {
            resultFormat.errmsg = "you are not a comment writer, wrong ID"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.delete_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_del = await dao.deleteComment(reqCommentIndex)
        resultFormat.success = true;
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.comment.delete_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
        return
    } catch (e) {
        console.log("error point : delete router in comment API")
        console.log(e)
    }
})

router.get("/total", async(req, res) => {
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "comment_list" : [],
    };
    try {
        const res_selAll = await dao.selectAllComments(DBUtil.commentTable)
        if(res_selAll.rows.length == 0) {
            resultFormat.errmsg = "there is no comments"
        } else {
            resultFormat.success = true;
            resultFormat.comment_list = res_selAll.rows;
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.comment.total_comment, 
        "", JSON.stringify(resultFormat));
        return
    } catch (e) {
        console.log("error point : /comment/total")
        console.log(e)
    }
})

module.exports = router;