const express = require("express");
const router = express.Router(); 
const app = express();
const path = require("path");
const postgredao = require("../module/postgreDAO/commentDAO");
const mongoLogDAO = require("../module/mongoLogDAO");
const apiType = require("../module/apiTypeInfo"); //
const checkSession = require("../module/checkSessionModule");
const msDAO = require("../module/mongoSessionDAO")
const cookieParser = require('cookie-parser');
app.use(cookieParser());

router.get("/", async(req, res) => {
    const postingIndex = req.query.index;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "comment_list": []
    }

    try {
        const res_sel = await postgredao.selectCommentWithPostingIndex(postingIndex)
        if (res_sel.rows.length == 0) {
            resultFormat.errmsg = "there is no comment having this posting index"
        } else {
            resultFormat.success = true
            resultFormat.comment_list = res_sel.rows
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
    const reqId = req.body.id ;
    const reqContent = req.body.content ;
    const reqBoardIndex = req.body.boardIndex;
    const reqPostingIndex = req.body.postingIndex;

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    }; 

    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }

    //TODO: 댓글이 달릴 포스팅이 실제 존재하는지 확인하는 코드?
    //TODO: 입력값이 sql 데이터 타입에 맞는지 검사하는 코드?
    try {
        const res_ins = await postgredao.insertComment(reqId, reqBoardIndex, reqPostingIndex, reqContent)
        resultFormat.success = true;
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.create_comment, 
        "", JSON.stringify(resultFormat))
    } catch (e) {
        console.log("error point : post router in comment API")
        console.log(e)
    }
})

router.put("/", async(req, res) => {
    let reqUserId;
    const reqId = req.body.id; //API 요청한 사람의 아이디 
    const reqContent = req.body.newContent;
    const reqCommentIndex = req.body.commentIndex;
    const reqPostingIndex = req.body.postingIndex

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    }

    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }

    try {
        const sessionWrap = await msDAO.findSessionWithSessionId(req.cookies.sessionId);
        reqUserId = JSON.parse(sessionWrap[0].session).user.id
        if (reqUserId != reqId) {
            resultFormat.errmsg = "you are not a posting writer, wrong ID"
            res.send(resultFormat);
            await mongoLogDAO.sendLog(reqUserId, apiType.board.update_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_upd = await postgredao.updateComment(reqId, reqPostingIndex, reqContent, reqCommentIndex)
        resultFormat.success = true;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqUserId, apiType.board.update_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat))
    } catch (e) {
        console.log("error point : put router in comment API")
        console.log(e)
    }
})

router.delete("/", async(req, res) => {
    let reqUserId;
    const reqId = req.body.id; //API 요청한 사람의 아이디
    const reqPostingIndex = req.body.postingIndex;
    const reqCommentIndex = req.body.commentIndex;
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
    };

    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }

    try {
        const sessionWrap = await msDAO.findSessionWithSessionId(req.cookies.sessionId);
        reqUserId = JSON.parse(sessionWrap[0].session).user.id
        if (reqUserId != reqId) {
            resultFormat.errmsg = "you are not a comment writer, wrong ID"
            res.send(resultFormat);
            await mongoLogDAO.sendLog(reqUserId, apiType.board.delete_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_del = await postgredao.deleteComment(reqId, reqPostingIndex, reqCommentIndex)
        resultFormat.success = true;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqUserId, apiType.board.delete_commment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat))
    } catch (e) {
        console.log("error point : delete router in comment API")
        console.log(e)
    }
})

router.get("/total", async(req, res) => {
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
        "comment_list" : [],
    };
    try {
        const res_sel = await postgredao.selectAllComment()
        if(res_sel.rows.length == 0) {
            resultFormat.errmsg = "there is no comments"
        } else {
            resultFormat.success = true;
            resultFormat.comment_list = res_sel.rows;
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.total_comment, 
        "", JSON.stringify(resultFormat))
    } catch (e) {
        console.log("error point : /comment/total")
        console.log(e)
    }
})

app.use('/', router);

module.exports = app;