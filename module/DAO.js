const client = require("../module/connectClient.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");

// unset table type
module.exports.selectWithId = (tableType, id) => {
    const text = 'SELECT * FROM ' + tableType + ' WHERE id=$1';
    const values = [id];

    return client.query(text, values);
}

module.exports.selectAll = (tableType)=>{
    const text = 'SELECT * FROM ' + tableType + '';
    const values = [];

    return client.query(text, values);
}

module.exports.deleteWithId = (tableType, id) =>{
    const text = 'DELETE FROM '+ tableType +' WHERE id=$1';
    const values = [id];
    
    return client.query(text, values);
}

// profile table
module.exports.updateProfileWithId = (name, generation, course, id) =>{
    const text = 'UPDATE '+ DBUtil.profileTable 
        + ' SET name=$1, generation=$2, course=$3 WHERE id=$4';
    const values = [name, generation, course, id];

    return client.query(text, values);
}

module.exports.insertProfile = (id, name, generation) => {
    const text = 'INSERT INTO ' + DBUtil.profileTable
        + '(id, name, generation) VALUES($1, $2, $3)';
    const values = [id, name, generation];

    return client.query(text, values);
}

// login table
module.exports.insertLogin = (id, pw, name) =>{
    const text = 'INSERT INTO ' + DBUtil.loginTable
        + ' VALUES($1, $2, $3)';
    const values = [id, pw, name];

    return client.query(text, values);
}

module.exports.updateLogin_PwWithId = (pw, id) =>{
    const text = 'UPDATE ' + DBUtil.loginTable 
        + ' SET pw=$1 WHERE id=$2';
    const values = [pw, id];

    return client.query(text, values);
}

// yet complete DAO
module.exports.update1ColWithId = (tableType, colName1, colVal1, id)=>{
    const text = 'UPDATE '+ tableType +' SET '+ colName1 +' = $1 WHERE id=$2';
    const values = [colVal1, id];

    return client.query(text, values);
}

//posting table 
module.exports.selectAllPostings = (tableType)=>{
    const text = 'SELECT * FROM ' + tableType

    return client.query(text);
}

module.exports.selectWithPostingIndex = (tableType, postingIndex) => {
    const text = 'SELECT * FROM ' + tableType + ' WHERE posting_index=$1';
    const values = [postingIndex];

    return client.query(text, values);
}

module.exports.insertPosting = (id, title, content, boardIndex) => {
    const text = 'INSERT INTO ' + DBUtil.postingTable
        + '(id, title, content, board_index, date) VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP)';
    const values = [id, title, content, boardIndex];

    return client.query(text, values);
}

module.exports.deletePosting = (postingIndex) => {
    const text = 'DELETE FROM '+ DBUtil.postingTable +' WHERE posting_index=$1';
    const values = [postingIndex];
    
    return client.query(text, values);
}

module.exports.updatePostingWithPostingIndex = (title, content, postingIndex) =>{
    const text = 'UPDATE '+ DBUtil.postingTable 
        + ' SET title=$1, content=$2 WHERE posting_index=$3';
    const values = [title, content, postingIndex];

    return client.query(text, values);
}

//comment table 
module.exports.insertComment = (id,content, boardIndex, postingIndex) => {
    const text = 'INSERT INTO ' + DBUtil.commentTable
        + '(id, content, board_index, posting_index, date) VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP)';
    const values = [id, content, boardIndex, postingIndex];

    return client.query(text, values);
}

module.exports.deleteComment = (postingIndex) => {
    const text = 'DELETE FROM '+ DBUtil.commentTable +' WHERE comment_index=$1';
    const values = [postingIndex];
    
    return client.query(text, values);
}