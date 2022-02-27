const express = require("express");
const router = express.Router(); 
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const mongoLogDAO = require("../module/mongoLogDAO");
const apiType = require("../module/apiTypeInfo");

router.post("/myposting", (req,res) => {
    const reqId = req.body.id
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting_list": []
    }
    // 사용자 정보 확인 : reqId가 login Table에 있는지 확인하기 
    dao.selectWithId(DBUtil.postingTable, reqId)
    .then(res_sel_p => {
        if (res_sel_p.rows.length == 0) {
            resultFormat.errmsg = "there is no postings written by this user"
        } else {
            resultFormat.success = true
            resultFormat.posting_list = res_sel_p.rows
        }
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.search.search_board, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })
    .catch (err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.search.search_board, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })
})

router.post("/mycomment", (req,res) => {
    const reqId = req.body.id
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "comment_list": []
    }
    // 사용자 정보 확인 : reqId가 login Table에 있는지 확인하기 
    dao.selectWithId(DBUtil.commentTable, reqId)
    .then(res_sel_c => {
        if (res_sel_c.rows.length == 0) {
            resultFormat.errmsg = "there is no comments written by this user"
        } else {
            resultFormat.success = true
            resultFormat.comment_list = res_sel_c.rows
        }
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.search.search_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })
    .catch (err => {
        resultFormat.errmsg = err;
        res.send(resultFormat);
        mongoLogDAO.sendLog("", apiType.search.search_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
    })
})


module.exports = router;