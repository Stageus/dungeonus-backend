const express = require("express");
const router = express.Router(); 
const app = express();
const path = require("path"); //
const postgredao = require("../module/postgreDAO/boardDAO"); //
const mongoLogDAO = require("../module/mongoDAO/mongoLogDAO");
const apiType = require("../module/mongoDAO/mongoLog_apiInfo"); //
const checkSession = require("../module/mongoDAO/checkSessionModule");
const msDAO = require("../module/mongoDAO/mongoSessionDAO")
const cookieParser = require('cookie-parser');
app.use(cookieParser());


//get a posting by posting Index
router.get("/", async (req,res) => {
    const postingIndex = req.query.index;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting": {}
    }

    try {
        const res_sel = await postgredao.selectPostingWithpostingIndex(postingIndex)
        if (res_sel.rows.length == 0) {     
            resultFormat.errmsg = "there is no posting having this posting index"
        } else {
            resultFormat.success = true
            resultFormat.posting = res_sel.rows
        }
            res.send(resultFormat)
            await mongoLogDAO.sendLog("", apiType.board.read_posting, 
            JSON.stringify(postingIndex), JSON.stringify(resultFormat));
    } catch (e) {
        console.log("error point : get router in board API")
        console.log(e)
    }
});

//write a posting 
router.post("/", async(req,res) => {
    const reqTitle = req.body.title 
    const reqContent = req.body.content 
    const reqBoardIndex = req.body.boardIndex

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    };

    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }

    try {
        //TODO: input 적합한지 검사 
        const sessionWrap = await msDAO.findSessionWithSessionId(req.cookies.sessionId);
        const reqUserId = JSON.parse(sessionWrap[0].session).user.id
        const res_ins = await postgredao.insertPosting(reqUserId, reqTitle, reqContent, reqBoardIndex)
        if (res_ins.rowCount == 1) {
            resultFormat.success = true;
        } else { 
            resultFormat.errmsg = res_ins.detail
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqUserId, apiType.board.create_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat))
    } catch (e) {
        console.log("error point : post router in board API")
        console.log(e)
        resultFormat.errmsg = e.message + " : " + e.detail;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqUserId, apiType.board.create_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat))
    }
});

//modify a posting 
router.put("/", async(req,res) => { 
    const reqTitle = req.body.title;
    const reqContent = req.body.content;
    const reqIndex = req.body.postingIndex;

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
        const reqUserId = JSON.parse(sessionWrap[0].session).user.id;
        const res_upd = await postgredao.updatePosting(reqUserId, reqTitle, reqContent, reqIndex);
        if (res_upd.rowCount == 1) {
            resultFormat.success = true;
        } else {   
            const res_sel_id = await postgredao.idExists(reqUserId)
            if (res_sel_id.rowCount == 0) {
                resultFormat.errmsg = "no ID in DB"
            } else {
                const res_sel_pi = await postgredao.postingIndexExists(reqIndex)
                if (res_sel_pi.rowCount == 0) {
                    resultFormat.errmsg = "no posting index in DB "
                } else {
                    resultFormat.errmsg = "not the posting writer"
                }
            } 
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqUserId, apiType.board.update_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat))
    } catch (e) {
        console.log("error point : put router in board API")
        console.log(e)
    }
});

//delete a posting
router.delete("/", async(req,res) => {
    const reqIndex = req.body.postingIndex;
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
        const res_del = await postgredao.deletePosting(reqUserId, reqIndex)
        if (res_del.rowCount == 1) {
            resultFormat.success = true;
        } else {
            const res_sel_id = await postgredao.idExists(reqUserId)
            if (res_sel_id.rowCount == 0) {
                resultFormat.errmsg = "no ID in DB"
            } else {
                const res_sel_pi = await postgredao.postingIndexExists(reqIndex)
                if (res_sel_pi.rowCount == 0) {
                    resultFormat.errmsg = "no posting index in DB "
                } else {
                    resultFormat.errmsg = "not the posting writer"
                }
            } 
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqUserId, apiType.board.delete_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat))
    } catch (e) {
        console.log("error point : delete router in board API")
        console.log(e)
    }
});

//get all postings
router.get("/total", async(req, res) => {
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
        "posting_list" : [],
    };
    try {
        const res_sel = await postgredao.selectAllPosting()
        if(res_sel.rows.length == 0) {
            resultFormat.errmsg = "there is no postings"
        } else {
            resultFormat.success = true;
            resultFormat.posting_list = res_sel.rows;
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.total_posting, 
        "", JSON.stringify(resultFormat));
    } catch (e) {
        console.log("error point : /board/total ")
        console.log(e)
    }
});

//get postings sorted by board index 
router.get("/peer", async(req,res) => {
    const reqBoardIndex = req.query.index;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting_list": []
    }
    // TODO: 게시판 인덱스 존재하는지 확인, 단순히 보드 인덱스 정수에 알맞은 범위인지만 체크하면 되는거 아냐?
    try {
        const res_sel = await postgredao.selectAllBoardWithPostingIndex(reqBoardIndex)
        if (res_sel.rows.length == 0) {
            resultFormat.errmsg = "there is no posting in this board"
        } else {
            resultFormat.success = true
            resultFormat.posting_list = res_sel.rows
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.read_board_postings, 
        JSON.stringify(reqBoardIndex), JSON.stringify(resultFormat));
        return
    } catch (e) {
        console.log("error point : /board/peer ")
        console.log(e)
    }
});

//search lists by a title of posting
router.post("/search", async(req,res) => {
    const reqWord = req.body.word;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting_list": []
    }
    //TODO : 이스케이프 코드나 %일때 예외처리 필요 
    try {
        const res_sel = await postgredao.selectPostingTitleLike(reqWord)
        if (res_sel.rows.length == 0) {
            resultFormat.errmsg = "no results which contains this search word"
        } else {
            resultFormat.success = true;
            resultFormat.posting_list = res_sel.rows;
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.search_title, 
        JSON.stringify(reqWord), JSON.stringify(resultFormat));
        return
    } catch(e) {
        console.log("error point : /board/search ")
        console.log(e)
    }
});

app.use('/', router);

module.exports = app;