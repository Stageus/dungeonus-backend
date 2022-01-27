const e = require("express");
const express = require("express");
const router = express.Router();
const path = require("path");
const { response } = require("../server_sects/server_sect1.js");
const client = require("../module/connectClient.js");
const {DBInfo, DBUtil} = require("../module/databaseModule.js");

router.post("/login", (req,res) =>{
    const reqId = req.id;
    const reqPw = req.pw;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
        "session_id" : "empty", // TODO: Create session function
    };

    client.query('SELECT * FROM $1 WHERE id=$2', [DBUtil.loginTable, reqId])
    .then(res=>{
        if (res.rows.length == 0) {
            resultFormat.errmsg = "There is no corresponding Id";
        }
        else {
            if (res.rows[0].pw == reqPassword) {
                resultFormat.success = true;
            }
            else {
                resultFormat.errmsg = "Wrong Password";
            }
        }
        response.send(resultFormat);
    })
    .catch(e =>{
        resultFormat.errmsg = e;
        response.send(resultFormat);
    });
});

router.post("/logout", (req,res)=>{
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };

    // TODO: Delete cookies and sessions after check those.
    
    response.send(resultFormat);
});

router.delete("/", (req,res) =>{
    const reqId = req.id;
    const resultFormat = {
        "success" : false,
        "errmsg" : "empty",
    };
    
    client.query('SELECT * FROM $1 WHERE id=$2', [DBUtil.loginTable, reqId])
    .then(res=>{
        if(res.rows.length == 0){
            resultFormat.errmsg = "There is no corresponding Id";
        }
        else{
            client.query("DELETE FROM $1 WHERE id=$2", [DBUtil.loginTable, reqId])
            .then(res_Delete=>{
                if(res_Delete.rows.length == 0){
                    resultFormat.errmsg = "There is occured trouble in delete";
                }
                else{
                    resultFormat.success = true;
                }
                response.send(resultFormat);
            })
            .catch(e=>{
                resultFormat.errmsg = e;
                response.send(resultFormat);
            });
        }
    })
    .catch(e=>{
        resultFormat.errmsg = e;
        response.send(resultFormat);
    });
});

// TODO: Complete remain routers
router.put("/", (req,res)=>{

});

router.post("/", (req,res)=>{

});

router.get("/total", () =>{
    
});

module.exports = router;