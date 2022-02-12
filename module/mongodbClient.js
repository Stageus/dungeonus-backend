const mongoose = require('mongoose');
const accountInfo = require('../accountData/mongodbAccountInfo');

const connect = () => {
    mongoose.connect('mongodb+srv://'+accountInfo.user+':'+accountInfo.password+'@dungeonus-cluster.2wk2k.mongodb.net/session-store?retryWrites=true&w=majority', function (err) {
        if (err) {
            console.error('mongodb connection error', err);
        }
        console.log('mongodb connected');
    });
}

connect();
const sessionSchema = new mongoose.Schema({
    _id: String,
    expires: Date,
    session: String,
})

const Session =  mongoose.model("session", sessionSchema);
Session.find((err, sessions)=>{
    if(err) return "error";
    if(Object.keys(sessions).length == 0) 
    console.log(sessions);
    else
    console.log(JSON.parse(sessions[0].session).user);
})
Session.find({ $search: '"id":"testid"' }, (err, sessions) => {
    console.log(sessions)
});

module.exports = Session;