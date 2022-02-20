const express = require("express");
const router = express.Router();
const app = express();
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");
const accountModule = require("../module/accountModule");
const apiType = require("../module/apiTypeInfo");

const session = require('express-session');
const mongoStore = require("../module/mongoSessionStore");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

const mongoLogDAO = require("../module/mongoLogDAO");

// session & cookie
const sessionObj = session({
    secret: 'test string', // TODO: change secret string
    resave: false, 
    saveUninitialized: false, 
    store: mongoStore,
    cookie: { secure: true,},
    reapInterval: 100,
});
app.use(sessionObj);
const cookieKeyName = 'sessionId';

// router
router.post("/login", async (req,res) =>{
    const reqId = req.body.id;
    const reqPw = req.body.pw;
    const ip = req.headers['x-forwarded-for'];
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "session_id" : "empty",
    };

    let res_loginSel;
    try{
        res_loginSel = await dao.selectWithId(DBUtil.loginTable, reqId);
    }
    catch(e){
        console.log("Exception in login router dao.selectWithId : ");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.login, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_loginSel.rows.length == 0) {
        resultFormat.errmsg = "There is no corresponding Id";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.login, ip,
             JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_loginSel.rows[0].pw != reqPw) {
        resultFormat.errmsg = "Wrong Password";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.login, ip,
             JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.success = true;

    // check session which corresponding to request id is exist
    const foundSessionLen = await accountModule.checkSessionWithUserIdRetLen(reqId);

    // if user's another session is already exist
    if (foundSessionLen != 0)
        await accountModule.deleteSessionWithUserIdRetNo(reqId);

    // Request session & cookie
    req.session.user = {
        'id': reqId,
        'pw': reqPw,
    };
    resultFormat.session_id = req.session.id;
    res.cookie(cookieKeyName, req.session.id);
    console.log(req.session.id);
    console.log(req.session.user);
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.login, ip,
        JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.post("/logout", async (req,res)=>{
    const reqId = req.body.id;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };
    const ip = req.headers['x-forwarded-for'];

    // Delete cookies and sessions after check those.
    req.session.destroy();
    res.clearCookie(cookieKeyName);
    await accountModule.deleteSessionWithUserIdRetNo(reqId);

    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.logout, ip,
        JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.delete("/", async (req, res) =>{
    const reqId = req.body.id;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };
    const ip = req.headers['x-forwarded-for'];

    let res_loginSel;
    try{
        res_loginSel = await dao.selectWithId(DBUtil.loginTable, reqId);
    }
    catch(e){
        console.log("Exception in delete router dao.selectWithId loginTable :");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    if (res_loginSel.rows.length == 0) {
        resultFormat.errmsg = "There is no corresponding Id";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    let res_profSel;
    try{
        res_profSel = await dao.selectWithId(DBUtil.profileTable, reqId);
    }
    catch(e){
        console.log("Exception in delete router dao.selectWithId profileTable :");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    if (res_profSel.rows.length == 0) {
        resultFormat.errmsg = "There is no corresponding Id";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    let res_loginDel;
    try{
        res_loginDel = await dao.deleteWithId(DBUtil.loginTable, reqId);
    }
    catch(e){
        console.log("Exception in delete router dao.deleteWithId loginTable :");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    if (res_loginDel.rows.rowCount == 0) {
        resultFormat.errmsg = "There is occured trouble in delete";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
            
    let res_profDel;
    try{
        res_profDel = await dao.deleteWithId(DBUtil.profileTable, reqId);
    }
    catch(e){
        console.log("Exception in delete router dao.deleteWithId profileTable :");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
        
    if (res_profDel.rows.rowCount == 0) {
        resultFormat.errmsg = "There is occured trouble in delete";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.delete_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.put("/", async (req,res)=>{
    const reqId = req.body.id;
    const reqName = req.body.name;
    const reqGeneration = req.body.generation;
    const reqCourse = req.body.course;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };
    const ip = req.headers['x-forwarded-for'];

    let res_profSel;
    try{
        res_profSel = await dao.selectWithId(DBUtil.profileTable, reqId);
    }
    catch(e){
        console.log("Exception in put router dao.selectWithId profileTable :");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.modify_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_profSel.rows.length == 0) {
        resultFormat.errmsg = "There is no corresponding Id";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.modify_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    let res_Update;
    try{
        res_Update = await dao.updateProfileWithId(reqName, reqGeneration, reqCourse, reqId);
    }
    catch(e){
        console.log("Exception in put router dao.updateProfileWithId :");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.modify_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
        
    if (res_Update.rowCount == 0) {
        resultFormat.errmsg = "There is occured trouble in update";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.modify_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.modify_account, ip, 
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
    const ip = req.headers['x-forwarded-for'];

    // check and insert profile table
    let res_profSel;
    try{
        res_profSel = await dao.selectWithId(DBUtil.profileTable, reqId);
    }
    catch(e){
        console.log("Exception in post router dao.selectWithId profileTable : ");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    // if profile row is already exist
    if (res_profSel.rows.length != 0) {
        resultFormat.errmsg = "Id is already exist in "
            + DBUtil.profileTable + " table";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    // insert profile table
    let res_profIns;
    try{
        res_profIns =  await dao.insertProfile(reqId, reqName, reqGeneration);
    }
    catch(e){
        console.log("Exception in post router dao.selectWithId profileTable : ");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    if (res_profIns.rowCount == 0) {
        resultFormat.errmsg = "There is occured trouble in insert";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    /*
    if insert profile table successfully
    next process is check and insert to login table
    */
    let res_loginSel;
    try{
        res_loginSel = await dao.selectWithId(DBUtil.loginTable, reqId);
    }
    catch(e){
        console.log("Exception in post router dao.selectWithId loginTable : ");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    // if login row is already exist
    if (res_loginSel.rows.length != 0) {
        resultFormat.errmsg = "Id is already exist in "
            + DBUtil.loginTable + " table";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    // insert login table
    let res_loginIns;
    try {
        res_loginIns = await dao.insertLogin(reqId, reqPw, reqName);
    }
    catch (e) {
        console.log("Exception in post router dao.insertLogin : ");
        console.log(e);
        /* 
        if insert profile table successfully
        but fail to login table 
        delete inserted profile table row
        */
        let res_profDel;
        try {
            res_profDel = await dao.deleteWithId(DBUtil.profileTable, reqId);
        }
        catch (e_inCatch) {
            console.log("Exception in post router dao.deleteWithId profileTable : ");
            console.log(e_inCatch);
            resultFormat.errmsg = e_inCatch;
            res.send(resultFormat);
            await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }

        if (res_profDel.rows.length == 0) {
            resultFormat.errmsg = "There is trouble in delete";
            res.send(resultFormat);
            await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }

        resultFormat.errmsg = "Completely delete inserted profile table";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_loginIns.rowCount == 0) {
        resultFormat.errmsg = "There is occured trouble in insert";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.create_account, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
    return;
});

router.get("/total", async (req, res) =>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "id_list" : [],
    };
    const ip = req.headers['x-forwarded-for'];

    let res_profSel;
    try{
        res_profSel = await dao.selectAll(DBUtil.profileTable);
    }
    catch(e){
        console.log("Exception in total router dao.selectAll profileTable : ");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.account.total_accont, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.id_list = res_profSel.rows;
    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog("", apiType.account.total_accont, ip, 
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
    const ip = req.headers['x-forwarded-for'];

    // check id is exist
    let res_loginSel;
    try{
        res_loginSel = await dao.selectWithId(DBUtil.loginTable, reqId);
    }
    catch(e){
        console.log("Exception in changepw router dao.selectWithId loginTable : ");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_loginSel.rows.length == 0) {
        resultFormat.errmsg = "There is no corresponding Id";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    // check cur_pw is correct pw
    if (res_loginSel.rows[0].pw != reqCurPw) {
        resultFormat.errmsg = "Wrong password";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    // check aft_pw's format is valid
    if(reqAftPw.replace(/ /gi, "") == '' || reqAftPw.replace(/ /gi, "")!= reqAftPw){
        resultFormat.errmsg = "After password is invalid format";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    // update pw to aft_pw
    let res_loginUdt;
    try{
        res_loginUdt = await dao.updateLogin_PwWithId(reqAftPw, reqId);
    }
    catch(e){
        console.log("Exception in changepw router dao.updateLogin_PwWithId : ");
        console.log(e);
        resultFormat.errmsg = e;
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    
    if (res_loginUdt.rowCount == 0) {
        resultFormat.errmsg = "There is trouble in update";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }

    resultFormat.success = true;
    res.send(resultFormat);
    await mongoLogDAO.sendLog(reqId, apiType.account.change_pw, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
});

router.get("/autologin", async (req, res)=>{
    let userId;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "session_id" : "empty",
    };
    const ip = req.headers['x-forwarded-for'];
    
    // TODO: using cookie's session id, 
    // find user info in current login database.
    const sessionId = req.cookies.sessionId;
    const foundSession = await accountModule.checkSessionWithSessionIdRetObj(sessionId);

    // if session exist get user id
    if(Object.values(foundSession).length > 0){
        userId = JSON.parse(foundSession[0].session).user.id;
    }

    if(Object.values(foundSession).length == 1){
        // if session is valid.
        const userInfo = JSON.parse(foundSession[0].session).user;
        const res_loginSel = await dao.selectWithId(DBUtil.loginTable, userInfo.id);

        if (res_loginSel.rows.length == 0) {
            resultFormat.errmsg = "There is no corresponding Id";
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userId, apiType.account.change_pw, ip, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }

        // check user pw
        if (res_loginSel.rows[0].pw == userInfo.pw) {
            // delete past session
            await accountModule.deleteSessionWithUserIdRetNo(userInfo.id);

            // Request session & cookie
            req.session.user = {
                'id': userInfo.id,
                'pw': userInfo.pw,
            };
            resultFormat.session_id = req.session.id;
            res.cookie(cookieKeyName, req.session.id);
            console.log("Changed session id : " + req.session.id);

            resultFormat.success = true;
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userId, apiType.account.change_pw, ip, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }
        else {
            resultFormat.errmsg = "Wrong Password";
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userId, apiType.account.change_pw, ip, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }
    }
    else if(Object.values(foundSession).length > 1){
        resultFormat.errmsg = "There is more than 1 row with same session id in session store";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(userId, apiType.account.change_pw, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    else{ // Object.values(foundSession).length == 0
        resultFormat.errmsg = "The session id is invalid";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(userId, apiType.account.change_pw, ip, 
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
    const ip = req.headers['x-forwarded-for'];

    const sessionId = req.cookies.sessionId;
    const foundSession = await accountModule.checkSessionWithSessionIdRetObj(sessionId);

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
            await mongoLogDAO.sendLog(userId, apiType.account.refresh_session, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }
        else {
            resultFormat.success = true;
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userId, apiType.account.refresh_session, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }
    }
    else if(Object.values(foundSession).length > 1){
        resultFormat.errmsg = "There is more than 1 row with same session id in session store";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(userId, apiType.account.refresh_session, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    else{ // Object.values(foundSession).length == 0
        resultFormat.errmsg = "The session id is invalid";
        res.send(resultFormat);
        await mongoLogDAO.sendLog(userId, apiType.account.refresh_session, ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
})

router.get("/checksession", async (req,res)=>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "validity" : false,
    };
    const ip = req.headers['x-forwarded-for'];

    const sessionId = req.cookies.sessionId;
    const foundSession = await accountModule.checkSessionWithSessionIdRetObj(sessionId);

    if(Object.values(foundSession).length == 1){
        // if session is valid.
        const userInfo = JSON.parse(foundSession[0].session).user;
        const res_loginSel = await dao.selectWithId(DBUtil.loginTable, userInfo.id);

        if (res_loginSel.rows.length == 0) {
            resultFormat.errmsg = "There is no corresponding Id";
            res.send(resultFormat);
            await mongoLogDAO.sendLog(userInfo.id, apiType.account.check_session, ip, 
                JSON.stringify(req.body), JSON.stringify(resultFormat));
            return;
        }
        else {
            if (res_loginSel.rows[0].pw == userInfo.pw) {
                resultFormat.success = true;
                resultFormat.validity = true;
                res.send(resultFormat);
                await mongoLogDAO.sendLog(userInfo.id, apiType.account.check_session, ip,
                    JSON.stringify(req.body), JSON.stringify(resultFormat));
                return;
            }
            else {
                resultFormat.errmsg = "Wrong Password";
                res.send(resultFormat);
                await mongoLogDAO.sendLog(userInfo.id, apiType.account.check_session, ip,
                    JSON.stringify(req.body), JSON.stringify(resultFormat));
                return;
            }
        }
    }
    else if (Object.values(foundSession).length > 1) {
        resultFormat.errmsg = "There is more than 1 row with same session id in session store";
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.account.check_session, ip,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
    else {
        resultFormat.success = true;
        resultFormat.errmsg = "The session id is invalid";
        res.send(resultFormat);
        await mongoLogDAO.sendLog("", apiType.account.check_session, ip,
            JSON.stringify(req.body), JSON.stringify(resultFormat));
        return;
    }
})

// router to only test
router.post("/test", async (req,res)=>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "test",
    };
    const ip = req.headers['x-forwarded-for'];

    console.log(req.sessionID);

    res.send(resultFormat);
    await mongoLogDAO.sendLog("testLog", "test", ip, 
            JSON.stringify(req.body), JSON.stringify(resultFormat));
});

app.use('/', router);

module.exports = app;