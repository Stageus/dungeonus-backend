const express = require("express");
const router = express.Router(); 
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const url = require("url");
const querystring = require('querystring');

//get a positing by posting Index
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
    })
    .catch (err => {
        resultFormat.errmsg = err
        res.send(resultFormat)
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
        "errmsg" : "none"
    };

    dao.insertPosting(reqId, reqTitle, reqContent, reqBoardIndex)
    .then(res => {
        resultFormat.success = true;
        res.send(resultFormat);
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
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

    dao.selectWithPostingIndex(DBUtil.postingTable, reqIndex)
    .then(res_sel=> {
        //console.log(res.rows[0])
        if (res_sel.rows[0].id != reqId) {
            resultFormat.errmsg = "you are not a posting writer, wrong ID"
            res.send(resultFormat);
        } else {
            dao.updatePostingWithPostingIndex(reqTitle, reqContent, reqIndex)
            .then(res_upd=>{
                console.log(res_upd);
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
        console.log("7")
        resultFormat.errmsg = err
        console.log("8")
        res.send(resultFormat)
    })
});

//delete a posting
router.delete("/", (req,res) => {
    const reqIndex = req.body.postingIndex;
    const resultFormat = {
        "success" : false,
        "errmsg" : "",
    };
    // 글 작성자가 맞는지 확인하는 과정 추가 

    dao.deletePosting(reqIndex)
    .then(res => {
        resultFormat.success = true;
        res.send(resultFormat);
    })
    .catch(err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
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
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
    })
});

//search lists by a title of posting (not yet)
router.post("/search", (req,res) => {
    
});

module.exports = router;