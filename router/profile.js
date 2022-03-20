const express = require("express");
const router = express.Router();
const app = express();
const postgredao = require("../module/postgreDAO/profileDAO");
const mongoLogDAO = require("../module/mongoDAO/mongoLogDAO");
const apiType = require("../module/mongoDAO/mongoLog_apiInfo");
const checkSession = require("../module/mongoDAO/checkSessionModule");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

router.post("/", async (req,res)=>{
    const reqId = req.body.id;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "profile_list" : {},
    };
    
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }

    // bring profile data
    let res_profSel;
    try{
        res_profSel = await postgredao.selectProfileWithId(reqId);
    }
    catch(e){
        console.log("Exception in profile router dao.selectProfileWithId : ");
        console.log(e);
        resultFormat.errmsg = e.message + " : " + e.detail;
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
    console.log(req.cookies);
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
        resultFormat.errmsg = e.message + " : " + e.detail;
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

app.use('/', router);

module.exports = app;