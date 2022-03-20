const session = require('express-session');

module.exports = session({
    secret: 'test string', // TODO: change secret string
    resave: false, 
    saveUninitialized: false, 
    store: mongoStore,
    cookie: { secure: true,},
    reapInterval: 100,
});