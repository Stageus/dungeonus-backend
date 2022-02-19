const LogModel = require('../module/mongoLogModel');

module.exports.sendLog = async (id, api, ip, req, res) => {
    let result = false;
    const logContent ={
        "log_time": new Date(),
        "user_id": id,
        "api_type": api,
        "user_ip": ip,
        "req_data": req,
        "res_data": res,
    };

    const err_crt = await LogModel.create(logContent);
    if(!err_crt){
        console.log("Error in mongoLogDAO.js sendLog module :");
        console.log(err_crt);
        return result;
    }
    result = true;
    return result;
};