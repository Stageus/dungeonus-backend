const LogModel = require('../module/mongoLogModel');

module.exports.createLog = async () => {
    // TODO: create log when log format is decided.
    LogModel.create({}, (err, res)=>{});
};