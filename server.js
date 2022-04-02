const express = require("express");
const https = require("https");
const app = express();
const httpPort = 80;
const httpsPort = 443;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sessionObj = require("./module/mongoDAO/sessionObj");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(sessionObj);

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
