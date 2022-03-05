const express = require("express");
const router = express.Router(); 
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const mongoLogDAO = require("../module/mongoLogDAO");
const apiType = require("../module/apiTypeInfo");

router.post("/myposting", async (req,res) => {
    const reqId = req.body.id // id which will be used to search for postings
    const reqUserId = "" // who requested this API
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting_list": []
    }

    try {
        //check if id exists in DB
        const res_id_exist = await dao.selectWithId(DBUtil.loginTable, reqId) 
        if (res_id_exist.rows.length == 0) {
            resultFormat.errmsg = "no corresponding ID in DB"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.search.search_board, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        //get all postings having reqId  
        const res_sel_p = await dao.selectWithId(DBUtil.postingTable, reqId)
        if (res_sel_p.rows.length == 0) { 
            resultFormat.errmsg = "there is no postings written by this user"
        } else {
            resultFormat.success = true
            resultFormat.posting_list = res_sel_p.rows
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.search.search_board, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
        return
    } catch (err) {
        console.log("error point : /search/myposting")
        console.log(err)
    }
})

router.post("/mycomment", async (req,res) => {
    const reqId = req.body.id
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "comment_list": []
    }

    try {
        //check if id exists in DB
        const res_id_exist = await dao.selectWithId(DBUtil.loginTable, reqId) 
        if (res_id_exist.rows.length == 0) {
            resultFormat.errmsg = "no corresponding ID in DB"
            res.send(resultFormat);
            await mongoLogDAO.sendLog("", apiType.search.search_comment, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return
        }
        //get all comments having reqId  
        const res_sel_c = await dao.selectWithId(DBUtil.commentTable, reqId)
        if (res_sel_c.rows.length == 0) { 
            resultFormat.errmsg = "there is no comments written by this user"
        } else {
            resultFormat.success = true
            resultFormat.comment_list = res_sel_c.rows
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.search.search_comment, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
        return
    } catch (err) {
        console.log("error point : /search/mycomment")
        console.log(err)
    }
})


module.exports = router;