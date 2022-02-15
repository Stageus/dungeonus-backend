const express = require("express");
const router = express.Router();
const app = express();
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");

const session = require('express-session');
const mongoStore = require("../module/mongoSessionStore");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

const sessionDAO = require("../module/mongoSessionDAO");

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

// path
const loginSuccessPage = "../server_sects/sect1_test/testLoginSuccess.html";

// router
router.post("/login", (req,res) =>{
    const reqId = req.body.id;
    const reqPw = req.body.pw;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "session_id" : "empty",
    };

    dao.selectWithId(DBUtil.loginTable, reqId)
    .then(async res_loginSel => {
        if (res_loginSel.rows.length == 0) {
            resultFormat.errmsg = "There is no corresponding Id";
        }
        else {
            if (res_loginSel.rows[0].pw == reqPw) {
                resultFormat.success = true;

                // check session which corresponding to request id is exist
                let foundSession;
                try{
                    foundSession = await sessionDAO.findSessionWithUserId(reqId);
                }
                catch(e){
                    console.log('Exception : find session');
                    console.log(e);
                }
                // if user's another session is already exist
                let deleteSession;
                if(Object.values(foundSession).length != 0){
                    deleteSession = await sessionDAO.deleteSessionWithUserId(reqId);
                }
                console.log("Login API delete session :");
                console.log(deleteSession);

                // Request session & cookie
                req.session.user = { 
                    'id' : reqId, 
                    'pw' : reqPw,
                };
                resultFormat.session_id = req.session.id;
                res.cookie(cookieKeyName, req.session.id);
                console.log(req.session.id);
                console.log(req.session.user);
            }
            else {
                resultFormat.errmsg = "Wrong Password";
            }
        }
        res.send(resultFormat);
    })
    .catch(e =>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
    });
});

router.post("/logout", (req,res)=>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    // Delete cookies and sessions after check those.
    req.session.destroy();
    res.clearCookie(cookieKeyName);
    resultFormat.success = true;

    res.send(resultFormat);
});

router.delete("/", (req, res) =>{
    const reqId = req.body.id;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    dao.selectWithId(DBUtil.loginTable, reqId)
    .then(res_loginSel=>{
        if(res_loginSel.rows.length == 0){
            resultFormat.errmsg = "There is no corresponding Id";
        }
        else{
            dao.selectWithId(DBUtil.profileTable, reqId)
            .then(res_profSel=>{
                if(res_profSel.rows.length == 0){
                    resultFormat.errmsg = "There is no corresponding Id";
                }
                else{
                    dao.deleteWithId(DBUtil.loginTable, reqId)
                    .then(res_loginDel=>{
                        if(res_loginDel.rows.length == 0){
                            resultFormat.errmsg = "There is occured trouble in delete";
                            res.send(resultFormat);
                            return;
                        }
                    })
                    .catch(e=>{
                        resultFormat.errmsg = e;
                        res.send(resultFormat);
                        return;
                    });

                    dao.deleteWithId(DBUtil.profileTable, reqId)
                    .then(res_profDel=>{
                        if(res_profDel.rows.length == 0){
                            resultFormat.errmsg = "There is occured trouble in delete";
                        }
                        else{
                            resultFormat.success = true;
                        }
                        res.send(resultFormat);
                    })
                    .catch(e=>{
                        resultFormat.errmsg = e;
                        res.send(resultFormat);
                    });
                }
            })
            .catch(e=>{
                resultFormat.errmsg = e;
                res.send(resultFormat);
            });
        }
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
    });
});

router.put("/", (req,res)=>{
    const reqId = req.body.id;
    const reqName = req.body.name;
    const reqGeneration = req.body.generation;
    const reqCourse = req.body.course;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    dao.selectWithId(DBUtil.profileTable, reqId)
    .then(res_profSel=>{
        if(res_profSel.rows.length == 0){
            resultFormat.errmsg = "There is no corresponding Id";
        }
        else{
            dao.updateProfileWithId(reqName, reqGeneration, reqCourse, reqId)
            .then(res_Update=>{
                console.log(res_Update);
                if(res_Update.rowCount == 0){
                    resultFormat.errmsg = "There is occured trouble in update";
                }
                else{
                    resultFormat.success = true;
                }
                res.send(resultFormat);
            })
            .catch(e=>{
                resultFormat.errmsg = e;
                res.send(resultFormat);
            });
        }
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
    });
});

router.post("/", (req,res)=>{
    const reqId = req.body.id;
    const reqName = req.body.name;
    const reqGeneration = req.body.generation;
    const reqPw = req.body.pw;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    // check and insert profile table
    dao.selectWithId(DBUtil.profileTable, reqId)
    .then(res_profSel=>{
        if(res_profSel.rows.length != 0){
            resultFormat.errmsg = "Id is already exist in " 
                + DBUtil.profileTable + " table";
            res.send(resultFormat);
        }
        else {
            dao.insertProfile(reqId, reqName, reqGeneration)
            .then(res_profIns=>{
                if(res_profIns.rowCount == 0){
                    resultFormat.errmsg = "There is occured trouble in insert";
                    res.send(resultFormat);
                }
                else{
                    /*
                    if insert profile table successfully
                    next process is check and insert to login table
                    */
                    dao.selectWithId(DBUtil.loginTable, reqId)
                    .then(res_loginSel=>{
                        if(res_loginSel.rows.length != 0){
                            resultFormat.errmsg = "Id is already exist in "
                                + DBUtil.loginTable + " table";
                            res.send(resultFormat);
                        }
                        else{
                            dao.insertLogin(reqId, reqPw, reqName)
                            .then(res_loginIns=>{
                                if(res_loginIns.rowCount == 0){
                                    resultFormat.errmsg = "There is occured trouble in insert";
                                    res.send(resultFormat);
                                }
                                else{
                                    resultFormat.success = true;
                                    res.send(resultFormat);
                                }
                            })
                            .catch(e=>{
                                resultFormat.errmsg = e;
                                res.send(resultFormat);
                            })
                        }
                    })
                    .catch(e=>{
                        resultFormat.errmsg = e;
                        /* 
                        if insert profile table successfully
                        but fail to login table 
                        delete inserted profile table row
                        */
                        dao.deleteWithId(DBUtil.profileTable, reqId)
                        .then(res_profDel=>{
                            if(res_profDel.rows.length == 0){
                                resultFormat.errmsg = "There is trouble in delete";
                                res.send(resultFormat);
                            }
                            else{
                                resultFormat.success = true;
                                res.send(resultFormat);
                            }
                        })
                        .catch(e=>{
                            resultFormat.errmsg = e;
                            res.send(resultFormat);
                        })
                    })
                }
            })
            .catch(e=>{
                resultFormat.errmsg = e;
                res.send(resultFormat);
            });
        }
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
    });
});

router.get("/total", (req, res) =>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "id_list" : [],
    };

    dao.selectAll(DBUtil.profileTable)
    .then(res_profSel=>{
        resultFormat.id_list = res_profSel.rows;
        resultFormat.success = true;
        res.send(resultFormat);
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
    })
});

router.post("/changepw", (req,res)=>{
    const reqId = req.body.id;
    const reqCurPw = req.body.cur_pw;
    const reqAftPw = req.body.aft_pw;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    // check cur_pw is correct pw
    dao.selectWithId(DBUtil.loginTable, reqId)
    .then(res_loginSel=>{
        if(res_loginSel.rows.length == 0){
            resultFormat.errmsg = "There is no corresponding Id";
            res.send(resultFormat);
        }

        if(res_loginSel.rows[0].pw == reqCurPw){
            // update pw to aft_pw
            dao.updateLogin_PwWithId(reqAftPw, reqId)
            .then(res_loginUdt=>{
                if(res_loginUdt.rowCount == 0){
                    resultFormat.errmsg = "There is trouble in update";
                    res.send(resultFormat);
                }
                else{
                    resultFormat.success = true;
                    res.send(resultFormat);
                }
            })
            .catch(e=>{
                resultFormat.errmsg = e;
                res.send(resultFormat);
            })
        }
        else{ // different password
            resultFormat.errmsg = "Wrong password";
            res.send(resultFormat);
        }
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        res.send(resultFormat);
    });
});

router.get("/autologin", async (req, res)=>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "session_id" : "empty",
    };
    
    // TODO: using cookie's session id, 
    // find user info in current login database.
    const sessionId = req.cookies.sessionId;
    let foundSession;
    try {
        foundSession = await sessionDAO.findSessionWithSessionId(sessionId);
    }
    catch (e) {
        console.log('Exception : find session');
        console.log(e);
    }

    if(Object.values(foundSession).length == 1){
        // if session is valid.
        const userInfo = JSON.parse(foundSession[0].session).user;
        const res_loginSel = await dao.selectWithId(DBUtil.loginTable, userInfo.id);
        if (res_loginSel.rows.length == 0) {
            resultFormat.errmsg = "There is no corresponding Id";
            res.send(resultFormat);
        }
        else {
            if (res_loginSel.rows[0].pw == userInfo.pw) {
                let deleteSession;
                if(Object.values(foundSession).length != 0){
                    deleteSession = await sessionDAO.deleteSessionWithUserId(userInfo.id);
                }
                console.log("Login API delete session :");
                console.log(deleteSession);

                // Request session & cookie
                req.session.user = { 
                    'id' : userInfo.id, 
                    'pw' : userInfo.pw,
                };
                resultFormat.session_id = req.session.id;
                res.cookie(cookieKeyName, req.session.id);
                console.log("Changed session id : " + req.session.id);

                resultFormat.success = true;
                res.send(resultFormat);
            }
            else {
                resultFormat.errmsg = "Wrong Password";
                res.send(resultFormat);
            }
        }
    }
    else if(Object.values(foundSession).length > 1){
        resultFormat.errmsg = "There is more than 1 row with same session id in session store";
        res.send(resultFormat);
    }
    else{
        resultFormat.errmsg = "The session id is invalid";
        res.send(resultFormat);
    }
});

router.get("/refreshsession", async(req,res)=>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    // check session is valid
    const sessionId = req.cookies.sessionId;
    let foundSession;
    try {
        foundSession = await sessionDAO.findSessionWithSessionId(sessionId);
    }
    catch (e) {
        console.log('Exception : find session');
        console.log(e);
    }

    if(Object.values(foundSession).length == 1){
        // if session is valid.
        mongoStore.touch(req.cookies.sessionId, sessionObj, (err)=>{
            if(err) console.log(err);
            else {
                resultFormat.success = true;
                res.send(resultFormat);
            }
        });   
    }
    else if(Object.values(foundSession).length > 1){
        resultFormat.errmsg = "There is more than 1 row with same session id in session store";
        res.send(resultFormat);
    }
    else{
        resultFormat.errmsg = "The session id is invalid";
        res.send(resultFormat);
    }
})

router.get("/checksession", async (req,res)=>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "validity" : false,
        "id" : "",
    };

    const sessionId = req.cookies.sessionId;
    let foundSession;
    try {
        foundSession = await sessionDAO.findSessionWithSessionId(sessionId);
    }
    catch (e) {
        console.log('Exception : find session');
        console.log(e);
    }

    if(Object.values(foundSession).length == 1){
        // if session is valid.
        const userInfo = JSON.parse(foundSession[0].session).user;
        const res_loginSel = await dao.selectWithId(DBUtil.loginTable, userInfo.id);
        if (res_loginSel.rows.length == 0) {
            resultFormat.errmsg = "There is no corresponding Id";
            res.send(resultFormat);
        }
        else {
            if (res_loginSel.rows[0].pw == userInfo.pw) {
                resultFormat.success = true;
                resultFormat.validity = true;
                resultFormat.id = userInfo.id;
                res.send(resultFormat);
            }
            else {
                resultFormat.errmsg = "Wrong Password";
                res.send(resultFormat);
            }
        }
    }
    else if(Object.values(foundSession).length > 1){
        resultFormat.errmsg = "There is more than 1 row with same session id in session store";
        res.send(resultFormat);
    }
    else{
        resultFormat.success = true;
        resultFormat.errmsg = "The session id is invalid";
        res.send(resultFormat);
    }
})

router.post("/test", (req,res)=>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "test",
    };

    console.log(req.sessionID);

    res.send(resultFormat);
});

app.use('/', router);

module.exports = app;