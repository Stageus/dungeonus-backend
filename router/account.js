const express = require("express");
const router = express.Router();
const postgredao = require("../module/postgreDAO/accountDAO");
const sessionModule = require("../module/mongoDAO/sessionModule");
const apiType = require("../module/mongoDAO/mongoLog_apiInfo");
const mongoStore = require("../module/mongoDAO/mongoSessionStore");
const mongoLogDAO = require("../module/mongoDAO/mongoLogDAO");
const checkSession = require("../module/mongoDAO/checkSessionModule");

const cookieKeyName = 'sessionId';

// router
router.post("/login", async (req,res) =>{
    const reqId = req.body.id;
    const reqPw = req.body.pw;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "session_id" : "empty",
    };

    let res_loginSel;
    try{
        res_loginSel = await postgredao.selectLoginWithId(reqId);
    }
    catch(e){
        console.log("Exception in login router dao.selectWithId : ");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.login,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_loginSel.rows.length == 0) {
        resultFormat.errmsg = "There is no corresponding Id";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.login,
             JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_loginSel.rows[0].pw != reqPw) {
        resultFormat.errmsg = "Wrong Password";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.login,
             JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.success = true;

    // check session which corresponding to request id is exist
    const foundSessionLen = await sessionModule.checkSessionWithUserIdRetLen(reqId);

    // if user's another session is already exist
    if (foundSessionLen != 0)
        await sessionModule.deleteSessionWithUserIdRetNo(reqId);

    // Request session & cookie
    req.session.user = {
        'id': reqId,
        'pw': reqPw,
    };
    resultFormat.session_id = req.session.id;
    res.cookie(cookieKeyName, req.session.id);
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.login,
        JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.post("/logout", async (req,res)=>{
    const reqId = req.body.id;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    // Delete cookies and sessions after check those.
    req.session.destroy();
    res.clearCookie(cookieKeyName);
    await sessionModule.deleteSessionWithUserIdRetNo(reqId);

    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.logout,
        JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.delete("/", async (req, res) =>{
    const reqId = req.body.id;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }
    
    let res_delAcnt;
    try{
        res_delAcnt = await postgredao.deleteLoginProfileWithId(reqId);
    }
    catch(e){
        console.log("Exception in delete router postgredao.deleteLoginProfileWithId loginTable :");
        console.log(e);
        resultFormat.errmsg = e.message + " : " + e.detail;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_delAcnt.rowCount == 0) {
        resultFormat.errmsg = "There is nothing to delete";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.post("/", async (req,res)=>{
    const reqId = req.body.id;
    const reqName = req.body.name;
    const reqGeneration = req.body.generation;
    const reqPw = req.body.pw;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    if(reqId == "" || reqName == "" || reqGeneration == ""){
        resultFormat.errmsg = "Input id, name, genearation";
        res.send(resultFormat);
        return;
    }

    let res_isrtAcnt;
    try{
        res_isrtAcnt = await postgredao.insertLoginProfile(reqId, reqName, reqGeneration, reqPw);
    }
    catch(e){
        console.log("Exception in post router postgredao.insertLoginProfile :");
        console.log(e);
        resultFormat.errmsg = e.message + " : " + e.detail;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    if (res_isrtAcnt.rowCount == 0) {
        resultFormat.errmsg = "There is occured trouble in insert";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.create_account, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.create_account, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
    return;
});

router.get("/total", async (req, res) =>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "profile_list" : [],
    };
    
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }
    
    let res_profSel;
    try{
        res_profSel = await postgredao.selectAllAcnt();
    }
    catch(e){
        console.log("Exception in total router postgredao.selectAllAcnt : ");
        console.log(e);
        resultFormat.errmsg = e.message + " : " + e.detail;
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.account.total_accont,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.profile_list = res_profSel.rows;
    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog("", apiType.account.total_accont,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.post("/changepw", async (req,res)=>{
    const reqId = req.body.id;
    const reqCurPw = req.body.cur_pw;
    const reqAftPw = req.body.aft_pw;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };
    
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }
    
    // check aft_pw's format is valid
    if(reqAftPw.replace(/ /gi, "") == '' || reqAftPw.replace(/ /gi, "")!= reqAftPw){
        resultFormat.errmsg = "After password is invalid format";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    // check aft_pw is same with cur_pw
    if(reqAftPw == reqCurPw){
        resultFormat.errmsg = "After password isn't allowed same with current password";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    // check id is exist
    let res_updateAcnt;
    try{
        res_updateAcnt = await postgredao.updateLogin(reqId, reqCurPw, reqAftPw);
    }
    catch(e){
        console.log("Exception in changepw router postgredao.updateLogin : ");
        console.log(e);
        resultFormat.errmsg = e.message + " : " + e.detail;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_updateAcnt.rowCount.length == 0) {
        resultFormat.errmsg = "There is no corresponding Account";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.change_pw,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.get("/autologin", async (req, res)=>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "session_id" : "empty",
    };
    
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }
    
    // TODO: using cookie's session id, 
    // find user info in current login database.
    const sessionId = req.cookies.sessionId;
    const foundSession = await sessionModule.checkSessionWithSessionIdRetObj(sessionId);
    
    let userId;
    // if session exist get user id
    if(Object.values(foundSession).length > 0){
        userId = JSON.parse(foundSession[0].session).user.id;
    }

    if(Object.values(foundSession).length == 1){
        // if session is valid.
        const userInfo = JSON.parse(foundSession[0].session).user;
        const res_loginSel = await postgredao.selectLoginWithId(userInfo.id);

        if (res_loginSel.rows.length == 0) {
            resultFormat.errmsg = "There is no corresponding Id";
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userId, apiType.account.change_pw, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }

        // check user pw
        if (res_loginSel.rows[0].pw == userInfo.pw) {
            // delete past session
            await sessionModule.deleteSessionWithUserIdRetNo(userInfo.id);

            // Request session & cookie
            req.session.user = {
                'id': userInfo.id,
                'pw': userInfo.pw,
            };
            resultFormat.session_id = req.session.id;
            res.cookie(cookieKeyName, req.session.id);

            resultFormat.success = true;
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userId, apiType.account.change_pw, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }
        else {
            resultFormat.errmsg = "Wrong Password";
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userId, apiType.account.change_pw,
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }
    }
    else if(Object.values(foundSession).length > 1){
        resultFormat.errmsg = "There is more than 1 row with same session id in session store";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(userId, apiType.account.change_pw,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    else{ // Object.values(foundSession).length == 0
        resultFormat.errmsg = "The session id is invalid";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(userId, apiType.account.change_pw,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
});

router.get("/refreshsession", async(req,res)=>{
    let userId;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };
    
    if((await checkSession(req.cookies.sessionId)) == false){
        resultFormat.errmsg = "Session is not valid";
        res.send(resultFormat);
        return;
    }
    
    const sessionId = req.cookies.sessionId;
    const foundSession = await sessionModule.checkSessionWithSessionIdRetObj(sessionId);

    // if session exist get user id
    if(Object.values(foundSession).length > 0){
        userId = JSON.parse(foundSession[0].session).user.id;
    }

    if(Object.values(foundSession).length == 1){
        // if session is valid.
        const err_touch = await mongoStore.touch(req.cookies.sessionId, sessionObj);
        if (err_touch) {
            console.log(err_touch);
            resultFormat.errmsg = "There is exception in mongoStore.session touch";
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userId, apiType.account.refresh_session, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }
        else {
            resultFormat.success = true;
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userId, apiType.account.refresh_session, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }
    }
    else if(Object.values(foundSession).length > 1){
        resultFormat.errmsg = "There is more than 1 row with same session id in session store";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(userId, apiType.account.refresh_session,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    else{ // Object.values(foundSession).length == 0
        resultFormat.errmsg = "The session id is invalid";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(userId, apiType.account.refresh_session,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
})

// router to only test
router.post("/test", async (req,res)=>{
    const resultFormat = {
        "success" : true,
        "errmsg" : "test",
    };

    console.log("mongoLog Test");

    res.send(resultFormat);
    await mongoLogDAO.sendLog("testLog", "test", 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
});

module.exports = router;