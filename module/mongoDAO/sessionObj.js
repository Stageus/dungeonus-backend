const session = require('express-session');
const mongoStore = require("./mongoSessionStore");

module.exports = session({
    secret: 'test string', // TODO: change secret string
    resave: false, 
    saveUninitialized: false, 
    store: mongoStore,
    cookie: { secure: true,},
    reapInterval: 100,
});