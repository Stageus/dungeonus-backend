const express = require("express");
const router = express.Router(); 
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const url = require("url");
const querystring = require('querystring');
const mongoLogDAO = require("../module/mongoLogDAO");
const apiType = require("../module/apiTypeInfo");

//get a posting by posting Index
router.get("/", (req,res) => {
    const postingIndex = req.query.index;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting": {}
    }

    dao.selectWithPostingIndex(DBUtil.postingTable, postingIndex)
    .then(res => {
        if (res.rows.length == 0) {
            resultFormat.errmsg = "there is no posting having this posting index"
        } else {
            resultFormat.success = true
            resultFormat.posting = res.rows
        }
        res.send(resultFormat)
        mongoLogDAO.sendLog("", apiType.board.read_posting, 
        JSON.stringify(postingIndex), JSON.stringify(resultFormat));
    })
    .catch (err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.read_posting, 
        JSON.stringify(postingIndex), JSON.stringify(resultFormat));
    })
});

//write a posting 
router.post("/", (req,res) => {
    const reqId = req.body.id 
    const reqTitle = req.body.title 
    const reqContent = req.body.content 
    const reqBoardIndex = parseInt(req.body.boardIndex)

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    };
    //TODO: session 확인  
    dao.selectWithId(DBUtil.loginTable, reqId)
    .then(res_sel_l => {
        if (res_sel_l.rows.length == 0) {
            resultFormat.errmsg = "no login information having this Id"
            res.send(resultFormat);
            mongoLogDAO.sendLog("", apiType.board.create_posting, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        } 
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.create_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })


    dao.insertPosting(reqId, reqTitle, reqContent, reqBoardIndex)
    .then(res => {
        resultFormat.success = true;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.create_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.create_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    });

});

//modify a posting 
router.put("/", (req,res) => { 
    const reqId = req.body.id;
    const reqTitle = req.body.title;
    const reqContent = req.body.content;
    const reqIndex = req.body.postingIndex;

    const resultFormat = {
        "success" : false,
        "errmsg" : ""
    }

    dao.selectWithId(DBUtil.loginTable, reqId)
    .then(res_sel_l => {
        if (res_sel_l.rows.length == 0) {
            resultFormat.errmsg = "no login information having this Id"
            res.send(resultFormat);
            mongoLogDAO.sendLog("", apiType.board.create_posting, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        } 
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
    })

    dao.selectWithPostingIndex(DBUtil.postingTable, reqIndex)
    .then(res_sel=> {
        if (res_sel.rows[0].id != reqId) {
            resultFormat.errmsg = "you are not a posting writer, wrong ID"
            res.send(resultFormat);
            mongoLogDAO.sendLog("", apiType.board.update_posting, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        } else {
            dao.updatePostingWithPostingIndex(reqTitle, reqContent, reqIndex)
            .then(res_upd=>{
                if(res_upd.rowCount == 0){
                    resultFormat.errmsg = "problems occured while updating";
                }
                else{
                    resultFormat.success = true;
                }
                res.send(resultFormat);
                mongoLogDAO.sendLog("", apiType.board.update_posting, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            })
            .catch(e=> {
                resultFormat.errmsg = e;
                res.send(resultFormat);
                mongoLogDAO.sendLog("", apiType.board.update_posting, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            })
        }
    })
    .catch (err => {
        resultFormat.errmsg = err
        res_sel.send(resultFormat)
    })
});

//delete a posting
router.delete("/", (req,res) => {
    const reqIndex = req.body.postingIndex;
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
    };
    dao.selectWithId(DBUtil.loginTable, reqId)
    .then(res_sel_l => {
        if (res_sel_l.rows.length == 0) {
            resultFormat.errmsg = "no login information having this Id"
            res.send(resultFormat);
            mongoLogDAO.sendLog("", apiType.board.create_posting, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        } 
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
    })
    //TODO: 댓글 작성자와 삭제 요청자가 맞는지 확인
    dao.deletePosting(reqIndex)
    .then(res=> {
        resultFormat.success = true;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.delete_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.delete_posting, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })
});

//get all postings
router.get("/total", (req, res) => {
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "posting_list" : [],
    };

    dao.selectAllPostings(DBUtil.postingTable)
    .then( res => {
        if(res.rows.length == 0) {
            resultFormat.errmsg = "there is no postings"
        } else {
            resultFormat.success = true;
            resultFormat.posting_list = res.rows;
        }
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.total_posting, 
        "", JSON.stringify(resultFormat));
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.total_posting, 
        "", JSON.stringify(resultFormat));
    })
});

//get postings sorted by board index 
router.get("/peer", (req,res) => {
    const boardIndex = req.query.index;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting_list": []
    }
    // TODO: 게시판 인덱스 존재하는지 확인, 단순히 보드 인덱스 정수에 알맞은 범위인지만 체크하면 되는거 아냐?
    dao.selectWithBoardIndex(DBUtil.postingTable, boardIndex)
    .then(res_selb => {
        if (res_selb.rows.length == 0) {
            resultFormat.errmsg = "there is no posting in this board"
        } else {
            resultFormat.success = true
            resultFormat.posting_list = res_selb.rows
        }
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.read_board_postings, 
        JSON.stringify(boardIndex), JSON.stringify(resultFormat));
    })
    .catch (err => {
        resultFormat.errmsg = err
        res.send(resultFormat)
        mongoLogDAO.sendLog("", apiType.board.read_board_postings, 
        JSON.stringify(boardIndex), JSON.stringify(resultFormat));
    })
});

//search lists by a title of posting
router.post("/search", (req,res) => {
    const reqWord = req.body.word;
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting_list": []
    }
    //TODO : 이스케이프 코드나 %일때 예외처리 필요 
    dao.searchWithTitle(reqWord)
    .then(res_sel => {
        if (res_sel.rows.length == 0) {
            resultFormat.errmsg = "no results which contains this search word"
        } else {
            resultFormat.success = true;
            resultFormat.posting_list = res_sel.rows;
        }
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.search_title, 
        JSON.stringify(reqWord), JSON.stringify(resultFormat));
    })
    .catch(e => {
        resultFormat.errmsg  = e;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.board.search_title, 
        JSON.stringify(reqWord), JSON.stringify(resultFormat));
    })
});

module.exports = router;