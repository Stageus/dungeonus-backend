const SessionModel = require('../module/mongoSessionModel');

module.exports.findSessionWithSessionId = (sessionId) => {
    SessionModel.find({ _id: sessionId })
        .exec((err, rows) => {
            if (err) { console.log(err); }
            else { return rows; }
        });
};

module.exports.findSessionWithUserId = (id) => {
    SessionModel.find()
        .regex('session', '"id":"' + id + '"')
        .exec((err, rows) => {
            if (err) { console.log(err); }
            else { return rows; }
        });
};