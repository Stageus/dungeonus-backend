const express = require("express");
const router = express.Router(); 
const app = express();
const path = require("path");
const postgredao = require("../module/postgreDAO/commentDAO");
const mongoLogDAO = require("../module/mongoDAO/mongoLogDAO");
const apiType = require("../module/mongoDAO/mongoLog_apiInfo"); //
const checkSession = require("../module/mongoDAO/checkSessionModule");
const msDAO = require("../module/mongoDAO/mongoSessionDAO")
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
    const reqContent = req.body.content ;
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

    //TODO: 입력값이 sql 데이터 타입에 맞는지 검사하는 코드?
    try {
        const sessionWrap = await msDAO.findSessionWithSessionId(req.cookies.sessionId);
        const reqUserId = JSON.parse(sessionWrap[0].session).user.id;
        const res_ins = await postgredao.insertComment(reqUserId, reqPostingIndex, reqContent)
        if (res_ins.rowCount == 1) {
            resultFormat.success = true;
        } 
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqUserId, apiType.board.create_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat))
    } catch (e) {
        console.log("error point : post router in comment API")
        console.log(e) // when posting index doesn't exist:
        resultFormat.errmsg = e.message + " : " + e.detail;
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.create_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat))
    }
})

router.put("/", async(req, res) => {
    const reqContent = req.body.newContent;
    const reqCommentIndex = req.body.commentIndex;

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
        const reqUserId = JSON.parse(sessionWrap[0].session).user.id
        const res_upd = await postgredao.updateComment(reqUserId, reqCommentIndex, reqContent)
        if (res_upd.rowCount == 1) {
            resultFormat.success = true;
        } else {
            const res_sel_id = await postgredao.idExists(reqUserId)
            if (res_sel_id.rowCount == 0) {
                resultFormat.errmsg = "no ID in DB"
            } else {
                const res_sel_c = await postgredao.commentIndexExists(reqCommentIndex)
                if (res_sel_c.rowCount == 0) {
                    resultFormat.errmsg = "no comment index in DB "
                } else {
                    resultFormat.errmsg = "not the comment writer"
                }
            }
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqUserId, apiType.board.update_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat))
    } catch (e) {
        console.log("error point : put router in comment API")
        console.log(e)
    }
})

router.delete("/", async(req, res) => {
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
        const reqUserId = JSON.parse(sessionWrap[0].session).user.id
        const res_del = await postgredao.deleteComment(reqUserId, reqCommentIndex)
        if (res_del.rowCount == 1) {
            resultFormat.success = true;
        } else {
            const res_sel_id = await postgredao.idExists(reqUserId)
            if (res_sel_id.rowCount == 0) {
                resultFormat.errmsg = "no ID in DB"
            } else {
                const res_sel_c = await postgredao.commentIndexExists(reqCommentIndex)
                if (res_sel_c.rowCount == 0) {
                    resultFormat.errmsg = "no comment index in DB "
                } else {
                    resultFormat.errmsg = "not the comment writer"
                }
            }
        }
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