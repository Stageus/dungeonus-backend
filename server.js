const express = require("express");
const https = require("https");
const app = express();
const httpPort = 8000;
const httpsPort = 8443;

// const options ={
//        key: fs.readFileSync(path.join(__dirname, "private.pem")),
// }

const server_sect1 = require("./server_sects/server_sect1.js");
app.use("/", server_sect1);

const server_sect2 = require("./server_sects/server_sect2.js");
app.use("/", server_sect2);

app.listen(httpPort, (req,res) =>{
       console.log(httpPort + " : server start");
});

// https.createServer(options, app).listen(httpsPort, (req,res)=>{
//        console.log(httpsPort + " : https server start");
// })