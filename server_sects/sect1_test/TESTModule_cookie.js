// const app = require("express")();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(cookieParser());
bodyParser.urlencoded({extended: false});
cookieParser();


const cookieConfig = { 
    httpOnly: true, 
    maxAge: 1000000, 
    signed: true 
};

module.exports.getCookie = (id) =>{
    // TODO: need issued session Id
    return cookie('sessionId', '1234', cookieConfig);
}