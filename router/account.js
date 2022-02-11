const express = require("express");
const router = express.Router();
const app = express();
const path = require("path");
const dao = require("../module/DAO.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");

const MongoStore = require('connect-mongo');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

const mongoStore = MongoStore.create({
    mongoUrl: 'mongodb+srv://user:00V893GLnF7LrI9p@dungeonus-cluster.2wk2k.mongodb.net/session-store?retryWrites=true&w=majority',
    autoRemove: 'interval',
    ttl: 3600,
});

// session & cookie
const sessionObj = session({
    secret: 'test string', // TODO: change secret string
    resave: false, 
    saveUninitialized: false, 
    // store: new FileStore(),
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
    .then(res_loginSel=>{
        if (res_loginSel.rows.length == 0) {
            resultFormat.errmsg = "There is no corresponding Id";
        }
        else {
            if (res_loginSel.rows[0].pw == reqPw) {
                resultFormat.success = true;

                // check session is exist
                mongoStore.

                // Request session & cookie
                req.session.user = { 
                    'id' : reqId, 
                    'pw' : reqPw,
                };
                resultFormat.session_id = req.session.id;
                res.cookie(cookieKeyName, req.session.id);
                console.log(req.session.id);
                console.log(req.session.user);

                // TODO: move to login complete page
                // res.sendFile(path.join(__dirname, loginSuccessPage));
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

router.get("/refreshSession", (req,res)=>{
    mongoStore.touch(req.cookies.sessionId, sessionObj, (err)=>{
        if(err) console.log(err);
    });

    res.send({});
})

router.get("/autologin", (req, res)=>{
    // TODO: using cookie's session id, 
    // find user info in current login database.
});

router.get("overlapLogin", (req,res)=>{

});

app.use('/', router);

module.exports = app;