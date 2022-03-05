const client = require("../connectClient.js");
const {DBInfo, DBUtil} = require("../databaseModule");

// commentDAO.js
module.exports.selectCommentWithcommentIndex = (commentIndex) => {
    const text = 'select * from ' + DBUtil.commentTable + 
        '   where comment_index = $1;';
    const values = [commentIndex];

    return client.query(text, values);
}

module.exports.insertComment = (id, postingIndex, title, content) => {
    const text = 'with checkid as (' + 
        'select * from ' + DBUtil.loginTable + 
        '   where id = $1' + 
        '), postingExist as (' + 
        'select * from ' + DBUtil.postingTable +
        '   where posting_index = $2' + 
        ')' +
        'insert into ' + DBUtil.commentTable + 
        '   (id, posting_index, title, content)' + 
        '   values($1, $2, $3, $4, CURRENT_TIMESTAMP);';
    const values = [id, postingIndex, title, content];

    return client.query(text, values);
}

module.exports.updateComment = (id, postingIndex, title, content, commentIndex) =>{
    const text = 'with checkid as (' + 
        'select * from ' + DBUtil.loginTable + 
        '   where id = $1' + 
        '), postingExist as (' + 
        'select * from ' + DBUtil.postingTable +
        '   where posting_index = $2' + 
        ')' +
        'update ' + DBUtil.commentTable + 
        '   set title = $2, content = $3' + 
        '   where comment_index = $4;';
    const values = [id, postingIndex, title, content, commentIndex];

    return client.query(text, values);
}

module.exports.deleteComment = (id, postingIndex, commentIndex)=>{
    const text = 'with checkid as (' + 
        'select * from ' + DBUtil.loginTable + 
        '   where id = $1' + 
        '), postingExist as (' + 
        'select * from ' + DBUtil.postingTable +
        '   where posting_index = $2' + 
        ')' +
        'delete ' + DBUtil.commentTable + 
        '   where comment_index = $3;';
    const values = [id, postingIndex, commentIndex];

    return client.query(text, values);
}

module.exports.selectAllComment = ()=>{
    const text = 'select * from ' + DBUtil.commentTable;
    const values = [];

    return client.query(text, values);
}

module.exports.selectAllBoardWithCommentIndex = (boardIndex)=>{
    const text = 'select comment_index, id, title, date ' +
        'from ' + DBUtil.commentTable +
        'where board_index = $1;';
    const values = [boardIndex];

    return client.query(text, values);
}

module.exports.selectCommentTitleLike = (word)=>{
    const text = 'select comment_index, id, title, date ' +
        'from ' + DBUtil.commentTable + 
        'where title like $1;';
    const values = ['%' + word + '%'];

    return client.query(text, values);
}