const express = require("express");
const router = express.Router();
const dao = require("../module/DAO.js");
const postgredao = require("../module/postgreDAO");
const mongoLogDAO = require("../module/mongoLogDAO");
const apiType = require("../module/apiTypeInfo");
const {DBInfo, DBUtil} = require("../module/databaseModule");

router.post("/", async (req,res)=>{
    const reqId = req.body.id;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "profile_list" : {},
    };
    
    // bring profile data
    let res_profSel;
    try{
        res_profSel = await dao.selectProfileWithId(reqId);
    }
    catch(e){
        console.log("Exception in profile router dao.selectProfileWithId : ");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.profile.show,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    // check profile data is exist or (two or more)
    if(res_profSel.rows.length == 0){
        resultFormat.errmsg = "Correspond id is nothing";
        res.send(resultFormat);
        return;
    }
    else if(res_profSel.rows.length > 1){
        console.log("Exception in profile router res_profSel.row.length..");
        resultFormat.errmsg = "There is overlapping id two or more";
        res.send(resultFormat);
        return;
    }
    resultFormat.profile_list = res_profSel.rows[0];
    resultFormat.success = true;

    res.send(resultFormat);
    await mongoLogDAO.sendLog("", apiType.profile.show, 
        JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.put("/", async (req,res)=>{
    const reqId = req.body.id;
    const reqProfile = req.body.profile;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };
    
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }
    
    let res_updateAcnt;
    try{
        res_updateAcnt = await postgredao.updateProfile(reqId, reqProfile);
    }
    catch(e){
        console.log("Exception in put router postgredao.updateProfile :");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    if (res_updateAcnt.rowCount == 0) {
        resultFormat.errmsg = "There is occured trouble in update";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.modify_account, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.modify_account,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
});

module.exports = router;