const sessionDAO = require("./mongoSessionDAO");

module.exports = async (sessionId) => {
    let valid = false;
    let foundSession;
    try{
        foundSession = await sessionDAO.findSessionWithSessionId(sessionId);
    }
    catch(e){
        console.log('Exception : checkSessionModule.js findSessionWithSessionId');
        console.log(e);
        return false;
    }

    if(Object.values(foundSession).length == 1){
        // if session is valid.
        valid = true;
    }
    else if (Object.values(foundSession).length > 1) {
        // session invalid : overlap session id exist
        console.log('Exception : checkSessionModule.js. session invalid - overlap session id exist')
    }
    else { // session invalid : session id not exist
    }

    return valid;
}