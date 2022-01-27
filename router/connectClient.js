const {Client} = require('pg');

const client = new Client({
    user: 'dungeonus',
    host: 'localhost',
    database: 'dungeonus',
    password: 'dun246geon',
    port: 5432,
});

client.connect()
.then(()=> console.log('server connected'))
.catch((err) => {
    console.log('DB connect error!');
    console.log(err);
});

module.exports = client;