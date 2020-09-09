const express = require('express');
const router = express.Router();
const ejs = require("ejs");
var session = require('express-session');
var path = require('path');
const pool = require('../core/pool');
var moment = require('moment');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use(express.static("public"));

router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


router.get("/admin-login",function(req,res){
    let doc = req.session.doc;
    if(doc)
    {
        var name = doc.name;
        var emailid = doc.email;
        var check = "select count(*) as count from AdminTable WHERE email='"+emailid+"' ";
        pool.query(check,function(err,results){
            console.log(results[0].count);

            if(results[0].count==0)
                res.redirect("/");
            else
                res.render("./admin/admin.ejs");
        })
    }
    else
       res.render("./admin/admin-login.ejs",{wrong: ""});
});


router.post("/admin-login",function(req,res){
    if(req.session.doc)
    {
        res.render("./admin/admin-login.ejs",{wrong: "Logout from previous session to continue."});
        return;
    }
    var email = req.body.email;
    var password = req.body.password;

    if(email && password)
    {
        pool.query("SELECT * FROM AdminTable WHERE email = '"+email+"' AND password = MD5('"+password+"')" , function(error,results,fields){
            if(results.length>0)
            {
                req.session.loggedin = true;
                req.session.doc = results[0];
                req.session.doc.type="admin";
                console.log(req.session.doc);
                res.redirect("/i-am-administrator");
            }
            else{
                res.render("./admin/admin-login.ejs",{wrong: "Incorrect login credentials. Try Again!"});
            }
        });
    }
    else
        {
            res.render("admin/admin-login.ejs",{wrong: "Incorrect login credentials. Try Again!"});            
        }
});


router.get("/logout-admin",function(req,res){
    if(req.session.doc)
    {
        req.session.destroy();
        res.redirect("/admin-login");
    }
    res.redirect("/");
})
router.get("/pharma-register",function(req,res){
    res.render("./admin/pharma-register.ejs");
});


router.get("/doctor-register",function(req,res){
    res.render("./admin/doctor-register.ejs");
});

router.post("/doctor-register",function(req,res){
    var Name = req.body.name;
    var Email = req.body.email;
    var Phone = req.body.phone;
    var Password = req.body.password;
    console.log(Name);
    var insertnewdoc = "INSERT INTO DoctorTable(email,name,phone,password) VALUES ('"+Email+"','"+ Name+"','"+Phone +"', MD5('"+Password+"'))";
    pool.query(insertnewdoc,function(err,result){
        if(err) throw err;
        console.log("Doctor registered!");
    });
    res.redirect("/i-am-administrator");
});

router.post("/pharma-register",function(req,res){
    var Name = req.body.name;
    var Email = req.body.email;
    var Phone = req.body.phone;
    var Password = req.body.password;
    console.log(Name);
    var insertnewdoc = "INSERT INTO PharmaTable(email,name,phone,password) VALUES ('"+Email+"','"+ Name+"','"+Phone +"', MD5('"+Password+"'))";
    pool.query(insertnewdoc,function(err,result){
        if(err) throw err;
        console.log("Pharmacist registered!");
    });
    res.redirect("/i-am-administrator");
});

router.get("/remove-doctor",function(req,res){
    var findDoctors = "SELECT * FROM DoctorTable";
    pool.query(findDoctors,function(err,results){
        if(err) throw err;
        res.render("./admin/remove-doctor.ejs",{data: results});
    })
});

router.post("/remove-doctor",function(req,res){
    var id = req.body.doctor;
    var deleteDoctor = "DELETE FROM DoctorTable WHERE id='"+id+"' ";
    pool.query(deleteDoctor,function(err,results){
        if(err) throw err;
        console.log("deleted");
        res.redirect("remove-doctor");
    })
})

router.get("/remove-pharma",function(req,res){
    var findDoctors = "SELECT * FROM PharmaTable";
    pool.query(findDoctors,function(err,results){
        if(err) throw err;
        res.render("./admin/remove-pharma.ejs",{data: results});
    })
});

router.post("/remove-pharma",function(req,res){
    var id = req.body.pharma;
    var deletePharma = "DELETE FROM PharmaTable WHERE id='"+id+"' ";
    pool.query(deletePharma,function(err,results){
        if(err) throw err;
        console.log("deleted Pharma");
        res.redirect("remove-pharma");
    })
})

router.get("/patient-history-admin",function(req,res){
    var getPatients = "SELECT * FROM PatientTable";
    pool.query(getPatients,function(err,results){
        if(err) throw err;
        res.render("./admin/patientHistory.ejs",{data: results,moment: moment});
    })
})

router.get("/customer-history",function(req,res){
    var getCustomers = "SELECT * FROM CustomerTable";
    pool.query(getCustomers,function(err,results){
        if(err) throw err;
        res.render("./admin/customer-history.ejs",{data: results,moment: moment});
    })
})

router.get("/aboutus-admin",function(req,res){
    res.render("./admin/aboutus-admin.ejs");
})
module.exports=router;