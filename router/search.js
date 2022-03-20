const express = require("express");
const router = express.Router(); 
const path = require("path");
const postgredao = require("../module/postgreDAO/searchDAO");
const mongoLogDAO = require("../module/mongoDAO/mongoLogDAO");
const apiType = require("../module/mongoDAO/mongoLog_apiInfo");

router.post("/myposting", async (req,res) => {
    const reqId = req.body.id // id whi used to search for postings
    const resultFormat = {
        "success": false,
        "errmsg": "",
        "posting_list": []
    }

    try {
        const res_sel = await postgredao.selectAllPostings(reqId)
        console.log(res_sel.rows)
        if (res_sel.rows.length == 0) {
            resultFormat.errmsg = "there is no postings written by this ID" 
        } else {
            resultFormat.success = true;
            resultFormat.posting_list = res_sel.rows;
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.search.search_board, 
        JSON.stringify(reqId), JSON.stringify(resultFormat));
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
        const res_sel = await postgredao.selectAllComments(reqId)
        if (res_sel.rows.length == 0) {
            resultFormat.errmsg = "there is no postings written by this ID" 
        } else {
            resultFormat.success = true;
            resultFormat.comment_list = res_sel.rows;
        }
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.search.search_comment, 
        JSON.stringify(reqId), JSON.stringify(resultFormat));
    } catch (err) {
        console.log("error point : /search/mycomment")
        console.log(err)
    }
})


module.exports = router;