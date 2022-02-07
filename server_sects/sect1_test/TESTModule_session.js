// const app = require("express")();
const session = require('express-session');
const FileStore = require('session-file-store')(session);

session({ 
    secret: 'test string', 
    resave: false, 
    saveUninitialized: true, 
    store: new FileStore() 
});

module.exports.getSession = (req_session) => {
    console.log('your session : ' + req_session);
    return;
    
    if(!req.session.num){
      req.session.num = 1;
    } else {
      req.session.num = req.session.num + 1;
    }
    res.send(`Number : ${req.session.num}`);
};