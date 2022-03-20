const SessionModel = require('./mongoSessionModel');

module.exports.findSessionWithSessionId = (sessionId) => {
    return SessionModel.find({ _id: sessionId });
};

// module.exports.findUserIdWithSessionId = (sessionId) => {
//     const sessionWrap = JSON.parse(SessionModel.find({ _id: sessionId }).session)
//     console.log(sessionWrap.user.id)
//     return sessionWrap.user.id
// };

module.exports.findSessionWithUserId = (id) => {
    return SessionModel.find()
        .regex('session', '"id":"' + id + '"');
};

module.exports.deleteSessionWithUserId = (id)=>{
    return SessionModel.deleteMany()
        .regex('session', '"id":"' + id + '"');
}