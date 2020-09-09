const express = require('express');
const app = express();
const ejs = require("ejs");
var session = require('express-session');
var path = require('path');
app.set("view-engine","ejs");
const pool = require('./core/pool');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
	secret: 'secret',
	resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 1000 * 30
    }
}));

const doctorRouter = require('./routes/doctorRouter');
app.use(doctorRouter);
const pharmaRouter = require('./routes/pharmaRouter');
app.use(pharmaRouter);
const adminRouter = require('./routes/adminRouter');
app.use(adminRouter);

app.get("/i-am-administrator",function(req,res){
    res.render("./admin/admin.ejs");
});

app.get("/",function(req,res){
    res.render("home.ejs");
});

app.listen(3000,function(){
    console.log("server started on port 3000...");
});


