const sessionDAO = require("./mongoSessionDAO");

// check session with user id return length
module.exports.checkSessionWithUserIdRetLen = async (id) => {
    let foundSession;
    try{
        foundSession = await sessionDAO.findSessionWithUserId(id);
    }
    catch(e){
        console.log('Exception : find session');
        console.log(e);
    }

    return Object.values(foundSession).length;
}

// check session with session id return objects
module.exports.checkSessionWithSessionIdRetObj = async (id) => {
    let foundSession;
    try{
        foundSession = await sessionDAO.findSessionWithSessionId(id);
    }
    catch(e){
        console.log('Exception : find session');
        console.log(e);
    }

    return foundSession;
}

// check session with session id return length
module.exports.checkSessionWithSessionIdRetLen = async (id) => {
    let foundSession;
    try{
        foundSession = await sessionDAO.findSessionWithSessionId(id);
    }
    catch(e){
        console.log('Exception : find session');
        console.log(e);
    }

    return Object.values(foundSession).length;
}

// delete session with user id return nothing
module.exports.deleteSessionWithUserIdRetNo = async (id) =>{
    let deleteSession;
    deleteSession = await sessionDAO.deleteSessionWithUserId(id);

    console.log("sessionModule.js delete session :");
    console.log(deleteSession);
}