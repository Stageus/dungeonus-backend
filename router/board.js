const express = require("express");
const router = express.Router(); 
const app = express();
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const mongoLogDAO = require("../module/mongoLogDAO");
const apiType = require("../module/apiTypeInfo");
const checkSession = require("../module/checkSessionModule");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//get a posting by posting Index
router.get("/", async (req,res) => {
    const postingIndex = req.query.index;
    const reqUserId = ""; //  who requested this API
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting": {}
    }

    try {
        const res_sel_p = await dao.selectWithPostingIndex(DBUtil.postingTable, postingIndex)
        if (res_sel_p.rows.length == 0) {     
            resultFormat.errmsg = "there is no posting having this posting index"
        } else {
            resultFormat.success = true
            resultFormat.posting = res_sel_p.rows
        }
            res.send(resultFormat)
            await mongoLogDAO.sendLog("reqUserId", apiType.board.read_posting, 
            JSON.stringify(postingIndex), JSON.stringify(resultFormat));
    } catch (e) {
        console.log("error point : get router in board API")
        console.log(e)
    }
});

//write a posting 
router.post("/", async(req,res) => {
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }

    const reqUserId = ""; //  who requested this API
    const reqId = req.body.id 
    const reqTitle = req.body.title 
    const reqContent = req.body.content 
    const reqBoardIndex = req.body.boardIndex

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    };

    try {
        //TODO: input 적합한지 검사 
        const res_sel_l = await dao.selectWithId(DBUtil.loginTable, reqId)
        if (res_sel_l.rows.length == 0) {
            resultFormat.errmsg = "no login information having this Id"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.create_posting, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_ins_p = await dao.insertPosting(reqId, reqTitle, reqContent, reqBoardIndex)
        resultFormat.success = true;
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.create_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
        return
    } catch (e) {
        console.log("error point : post router in board API")
        console.log(e)
    }
});

//modify a posting 
router.put("/", async(req,res) => { 
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }

    const reqUserId = ""; //  who requested this API
    const reqId = req.body.id;
    const reqTitle = req.body.title;
    const reqContent = req.body.content;
    const reqIndex = req.body.postingIndex;

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    }
    try {
        const res_sel_l = await dao.selectWithId(DBUtil.loginTable, reqId)
        if (res_sel_l.rows.length == 0) {
            resultFormat.errmsg = "no login information having this Id"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.update_posting, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_sel_p = await dao.selectWithPostingIndex(DBUtil.postingTable, reqIndex)
        if (res_sel_p.rows[0].id != reqId) {
            resultFormat.errmsg = "you are not a posting writer, wrong ID"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.update_posting, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }

        const res_upd = await dao.updatePostingWithPostingIndex(reqTitle, reqContent, reqIndex)
        if (res_upd.rowCount == 0) {
            resultFormat.errmsg = "problem occured while updating query"
        } else {
            resultFormat.success = true;
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("reqUserId", apiType.board.update_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
        return
    } catch (e) {
        console.log("error point : put router in board API")
        console.log(e)
    }
});

//delete a posting
router.delete("/", async(req,res) => {
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }
    const reqUserId = ""; //  who requested this API
    const reqId = req.body.id;
    const reqIndex = req.body.postingIndex;
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
    };

    try {
        const res_sel_l = await dao.selectWithId(DBUtil.loginTable, reqId)
        if (res_sel_l.rows.length == 0) {
            resultFormat.errmsg = "no login information having this Id"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.delete_posting, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        } 
        const res_sel_p = await dao.selectWithPostingIndex(DBUtil.postingTable, reqIndex)
        if (res_sel_p.rows[0].id != reqId) {
            resultFormat.errmsg = "you are not a posting writer, wrong ID"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.board.delete_posting, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        const res_del = await dao.deletePosting(reqIndex)
        resultFormat.success = true;
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.delete_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
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
        const res_sel = await dao.selectAllPostings(DBUtil.postingTable)
        if(res_sel.rows.length == 0) {
            resultFormat.errmsg = "there is no postings"
        } else {
            resultFormat.success = true;
            resultFormat.posting_list = res_sel.rows;
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.total_posting, 
        "", JSON.stringify(resultFormat));
        return
    } catch (e) {
        console.log("error point : /board/total ")
        console.log(e)
    }
});

//get postings sorted by board index 
router.get("/peer", async(req,res) => {
    const boardIndex = req.query.index;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting_list": []
    }
    // TODO: 게시판 인덱스 존재하는지 확인, 단순히 보드 인덱스 정수에 알맞은 범위인지만 체크하면 되는거 아냐?
    try {
        const res_selb = await dao.selectWithBoardIndex(DBUtil.postingTable, boardIndex)
        if (res_selb.rows.length == 0) {
            resultFormat.errmsg = "there is no posting in this board"
        } else {
            resultFormat.success = true
            resultFormat.posting_list = res_selb.rows
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.board.read_board_postings, 
        JSON.stringify(boardIndex), JSON.stringify(resultFormat));
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
        const res_sel = await dao.searchWithTitle(reqWord)
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

module.exports = router;