const { json } = require('body-parser');
const mongoose = require('mongoose');

const connect = () => {
    mongoose.connect('mongodb+srv://user:00V893GLnF7LrI9p@dungeonus-cluster.2wk2k.mongodb.net/session-store?retryWrites=true&w=majority', function (err) {
        if (err) {
            console.error('mongodb connection error', err);
        }
        console.log('mongodb connected');
    });
}
  
connect();
// mongoose.connection.on('disconnected', connect);

// const studentSchema = new mongoose.Schema({
//     name: String,
//     score: Number,
// })
// const Student = mongoose.model("Studentu", studentSchema);
// const student1 = new Student({
//     name: 'testname',
//     score: 1,
// })
// const example =  student1.save()
//     .then(() => {
//         console.log('success');
//     })
//     .catch((e) => {
//         console.log(e);
//     })

const sessionSchema = new mongoose.Schema({
    _id: String,
    expires: Date,
    session: String,
})

const Session =  mongoose.model("session", sessionSchema);
Session.find((err, sessions)=>{
    if(err) return "error";
    console.log(JSON.parse(sessions[0].session).user);
})

// module.exports = ;