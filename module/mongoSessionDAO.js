const SessionModel = require('../module/mongoSessionModel');

module.exports.findSessionWithSessionId = (sessionId) => {
    return SessionModel.find({ _id: sessionId });
};

module.exports.findSessionWithUserId = (id) => {
    return SessionModel.find()
        .regex('session', '"id":"' + id + '"');
};

module.exports.deleteSessionWithUserId = (id)=>{
    return SessionModel.deleteMany()
        .regex('session', '"id":"' + id + '"');
}