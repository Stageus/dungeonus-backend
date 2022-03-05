const client = require("../connectClient.js");
const {DBInfo, DBUtil} = require("../databaseModule");

// boardDAO.js
module.exports.selectPostingWithpostingIndex = (postingIndex) => {
    const text = 'select * from ' + DBUtil.postingTable + 
        '   where posting_index = $1;';
    const values = [postingIndex];

    return client.query(text, values);
}

module.exports.insertPosting = (id, title, content) => {
    const text = 'with checkid as (' + 
        '   select * from ' + DBUtil.loginTable + 
        '       where id = $1' + 
        ')' + 
        'insert into ' + DBUtil.postingTable + 
        '   values($1, $2, $3, CURRENT_TIMESTAMP);';
    const values = [id, title, content];

    return client.query(text, values);
}

module.exports.updatePosting = (id, title, content, postingIndex) =>{
    const text = 'with checkid as (' + 
        'select * from ' + DBUtil.loginTable + 
        '   where id = $1' + 
        ')' + 
        'update ' + DBUtil.postingTable + 
        '   set title = $2, content = $3' + 
        '   where posting_index = $4;';
    const values = [id, title, content, postingIndex];

    return client.query(text, values);
}

module.exports.deletePosting = (id, postingIndex)=>{
    const text = 'with checkid as (' + 
        'select * from ' + DBUtil.loginTable + 
        '   where id = $1' + 
        ')' + 
        'delete ' + DBUtil.postingTable + 
        '   where posting_index = $2;';
    const values = [id, postingIndex];

    return client.query(text, values);
}

module.exports.selectAllPosting = ()=>{
    const text = 'select * from ' + DBUtil.postingTable;
    const values = [];

    return client.query(text, values);
}

module.exports.selectAllBoardWithPostingIndex = (boardIndex)=>{
    const text = 'select posting_index, id, title, date ' + 
        'from ' + DBUtil.postingTable +
        'where board_index = $1;';
    const values = [boardIndex];

    return client.query(text, values);
}

module.exports.selectPostingTitleLike = (word)=>{
    const text = 'select posting_index, id, title, date ' + 
        'from ' + DBUtil.postingTable + 
        'where title like $1;';
    const values = ['%' + word + '%'];

    return client.query(text, values);
}