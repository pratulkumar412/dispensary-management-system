const express = require('express');
const router = express.Router();
const ejs = require("ejs");
var session = require('express-session');
var path = require('path');
const pool = require('../core/pool');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use(express.static("public"));

router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


router.get("/doctor-login",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='doctor')
    {
        var name = doc.name;
        var emailid = doc.email;
        var check = "select count(*) as count from DoctorTable WHERE email='"+emailid+"' ";
        pool.query(check,function(err,results){
            console.log(results[0].count);

            if(results[0].count==0)
                res.redirect("/");
            else
                res.render("./doctor/doctor-loggedin.ejs",{name: name});
        })
    }
    else
       res.render("./doctor/doctor-login.ejs",{wrong: ""});
});

router.post("/doctor-login",function(req,res){
    if(req.session.doc)
    {
        res.render("./doctor/doctor-login.ejs",{wrong: "Logout from previous session to continue."});
        return;
    }
    var email = req.body.email;
    var password = req.body.password;

    if(email && password)
    {
        pool.query("SELECT * FROM DoctorTable WHERE email = '"+email+"' AND password = MD5('"+password+"')" , function(error,results,fields){
            if(results.length>0)
            {
                req.session.loggedin = true;
                req.session.doc = results[0];
                req.session.doc.type="doctor";
                console.log(req.session.doc);
                res.redirect("doctor/loggedin");
            }
            else{
                res.render("./doctor/doctor-login.ejs",{wrong: "Incorrect login credentials. Try Again!"});
            }
        });
    }
    else
        {
            res.render("doctor/doctor-login.ejs",{wrong: "Incorrect login credentials. Try Again!"});            
        }
});

router.post("/newpatient-doctor",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='doctor')
    {
        var doctor_id = doc.id;
        var name = req.body.name;
        var roll = req.body.roll_no;
        var age = req.body.age;
        var gender = req.body.gender;
        var address = req.body.address;
        var symptom = req.body.symptom;
        var insertNewPatient = "INSERT INTO PatientTable (doctor,rollno,name,age,gender,hostel,symptom,time) VALUES ('"+doctor_id+"','"+roll+"','"+name+"','"+age +"','"+gender+"','"+address+"','"+symptom+"',NOW())";
        pool.query(insertNewPatient,function(err,result){
            if(err) throw err;
            console.log("New patient added");
        });
        res.redirect("/newpatient-doctor");
    }
    else
    {
        res.redirect("/doctor-login");
    }
    

});

router.get("/doctor/loggedin",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='doctor')
    {
        var name = doc.name;
        res.render("./doctor/doctor-loggedin.ejs",{name: name});
    }
    else
        res.redirect("/doctor-login");
});

router.get("/newpatient-doctor",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='doctor')
    {
        var name = doc.name;
        var PatientCount = "select count(*) as count from PatientTable";
        pool.query(PatientCount,function(err,results){
            var Count =results[0].count + 1;
            res.render("./doctor/newpatient-doctor.ejs",{name: name, patientCount: Count});
        })
    }
    else
    {
        res.redirect("/doctor-login");
    }
});

router.get("/medicines-available",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='doctor')
    {
        var name = doc.name;
        var mediAvial = "SELECT name FROM MedicineTable;"
        pool.query(mediAvial,function(err,results)
        {
            if(err) throw err;
            res.render("./doctor/medicineAvailable.ejs",{name: name,data:results});
        });        
    }
    else
    {
        res.redirect("/doctor-login");
    }
});

router.get("/patient-history",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='doctor')
    {
        var name = doc.name;
        
        var patientQuery = "SELECT * FROM PatientTable WHERE doctor='"+doc.id+"'";
        pool.query(patientQuery,function(err,rows){
            if(err) throw err;
            res.render("./doctor/patientHistory.ejs",{name: name, data: rows});
        })
    }
    else
    {
        res.redirect("/doctor-login");
    }
});

router.get("/logout-doctor",function(req,res){
    if(req.session.doc)
    {
        req.session.destroy();
        res.redirect("/doctor-login");
    }
})

module.exports = router;