const express = require('express');
const router = express.Router();
const ejs = require("ejs");
var session = require('express-session');
var path = require('path');
const pool = require('../core/pool');

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());
router.use(express.static("public"));
router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));





router.post("/pharma-login",function(req,res){
    var email = req.body.email;
    var password = req.body.password;
    if(req.session.doc)
    {
        res.render("./pharma/pharma-login.ejs",{wrong: "Logout from previous session to continue."});
        return;
    }
    if(email && password)
    {
        pool.query("SELECT * FROM PharmaTable WHERE email = '"+email+"' AND password = MD5('"+password+"')" , function(error,results,fields){
            if(results.length>0)
            {
                req.session.loggedin = true;
                req.session.doc = results[0];
                req.session.doc.type="pharma";
                console.log(req.session.doc);
                res.redirect("pharma/loggedin");
            }
            else{
                res.render("./pharma/pharma-login.ejs",{wrong: "Incorrect login credentials. Try Again!"});
            }
        });
    }
    else
        {
            res.render("pharma/pharma-login.ejs",{wrong: "Incorrect login credentials. Try Again!"});            
        }
});

router.get("/pharma-login",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='pharma')
    {
        var name = doc.name;
        var emailid = doc.email;
        var check = "select count(*) as count from PharmaTable WHERE email='"+emailid+"' ";
        pool.query(check,function(err,results){
            console.log(results[0].count);

            if(results[0].count==0)
                res.redirect("/");
            else
                res.render("./pharma/pharma-loggedin.ejs",{name: name});
        })
    }
    else
       res.render("./pharma/pharma-login.ejs",{wrong: ""});
});


router.get("/pharma/loggedin",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='pharma')
    {
        var name = doc.name;
        res.render("./pharma/pharma-loggedin.ejs",{name: name});
    }
    else
        res.redirect("/pharma-login");
});


router.get("/newcustomer-pharma",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='pharma')
    {
        var items;
        var name = doc.name;
        var medicinesList = "SELECT name FROM MedicineTable";
        pool.query(medicinesList,function(err,results){
            if(err) throw err;
                items=results;
                res.render("./pharma/newcustomer-pharma.ejs",{name: name, items: results});
        });        
    }
    else
    {
        res.redirect("/pharma-login");
    }
});


router.post("/newcustomer-pharma",function(req,res){
    var id=req.body.id;
    console.log(id);
    var drug_id,quantity;
    var roll,name,hostel;
    var find = "select rollno,name,hostel from PatientTable where id='"+id+"'" ;

    function findPatientDetails(query_string, callback){
        setTimeout(function() {
            pool.query(query_string,function(err,results){
                if(err) throw err;
                console.log("Patient details found!");
                console.log(results);
                roll = results[0].rollno;
                name = results[0].name;
                hostel = results[0].hostel;
            });
            callback();
        }, 100);
    }
    function getDrugId(drug_id_string,callback){
        setTimeout(function(){
        pool.query(drug_id_string,function(err,results){
            if(err) throw err;
            drug_id = results[0].id;
            console.log("drug id is: "+drug_id);
        });
        callback();
    },100);
    }
    function twoTasks(){
        setTimeout(function(){
            var update = "UPDATE MedicineTable SET unit=unit-'"+quantity+"' WHERE id='"+drug_id+"' ";
            pool.query(update,function(err,resultOfUpdate){
                if(err) throw err;
                console.log("1 row updated.");
            });
            var insertNewCustomer = "INSERT INTO CustomerTable(id,rollno,name,hostel,drugid,units,time) VALUES('"+id+"','"+roll+"','"+name+"','"+hostel+"','"+drug_id+"','"+quantity+"',NOW())";
            pool.query(insertNewCustomer,function(err,resultOfInsertCusto){
                if(err) 
                    console.log(err);
                else{
                    console.log("customer added");
                }
            });
        },100);
    }
    var i=0;
    function myLoop () {
        setTimeout(function () {
            quantity=req.body.item_quantity[i];
            var drug_id_string = "select id from MedicineTable where name= '"+req.body.item_unit[i]+"' ";
            getDrugId(drug_id_string,twoTasks);
            i++;
            if (i < req.body.item_unit.length) {
                myLoop();                 
            }
        }, 200)
     }
     
    function updateEveryEntry(){
        setTimeout(function(){
            myLoop();
         },500);
    }
    findPatientDetails(find,updateEveryEntry);
    res.redirect("/newcustomer-pharma");
})

router.get("/medicines-available-pharma",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='pharma')
    {
        var items;
        var name = doc.name;
        var medicinesList = "SELECT name,unit FROM MedicineTable";
        pool.query(medicinesList,function(err,results){
            if(err) throw err;
            res.render("./pharma/medicineAvailable.ejs",{name: name, data: results});
        });        
    }
    else
    {
        res.redirect("/pharma-login");
    }
})


router.get("/add-medicines",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='pharma')
    {
        var items;
        var name = doc.name;
        var medicinesList = "SELECT name FROM MedicineTable";
        pool.query(medicinesList,function(err,results){
            if(err) throw err;
                items=results;
                res.render("./pharma/new-medicine.ejs",{name: name, items: results});
        });        
    }
    else
    {
        res.redirect("/pharma-login");
    }
});

router.post("/add-medicines",function(req,res){
    var drugName = req.body.name;
    var quantity = req.body.quantity;

    var exist = "select count(*) as count from MedicineTable where name='"+drugName+"' ";
    pool.query(exist,function(err,results){
        if(results[0].count==0){
            var insert = "insert into MedicineTable(name,unit) values('"+drugName+"','"+quantity+"')";
            pool.query(insert,function(err,result){
                if(err) throw err;
                console.log("new medicine added.");
            })
        }
        else{
            var update = "update MedicineTable set unit=unit+'"+quantity+"' where name='"+drugName+"' ";
            pool.query(update,function(err,result){
                if(err) throw err;
                console.log("updated one row in medicine table");
            })
        }
        res.redirect("/add-medicines");
    })
})

router.get("/remove-medicines",function(req,res){
    let doc = req.session.doc;
    if(doc && doc.type=='pharma')
    {
        var name = doc.name;
        var medicinesList = "SELECT * FROM MedicineTable";
        pool.query(medicinesList,function(err,results){
            if(err) throw err;
            res.render("./pharma/remove-medicine.ejs",{name: name, items: results});
        });        
    }
    else
    {
        res.redirect("/pharma-login");
    }
});

router.post("/remove-medicines",function(req,res){
    var i=0;
    function myLoop1 () {           //  create a loop function
        setTimeout(function () {
            quantity=req.body.item_quantity[i];
            var update = "UPDATE MedicineTable set unit=unit-'"+quantity+"' where name='"+req.body.item_unit[i]+"' ";
            pool.query(update,function(err,result){
                if(err) throw err;
                console.log("1 row updated");
            });       
            i++;                     //  increment the counter
            if (i < req.body.item_unit.length) {            //  if the counter < 10, call the loop function
                myLoop1();                 
            }
            else{
                console.log("Done removing...");
            }
        }, 200)
    }
    
    myLoop1();
    res.redirect("/pharma/loggedin");
    return;
})

router.get("/logout-pharma",function(req,res){
    if(req.session.doc)
    {
        req.session.destroy();
        res.redirect("/pharma-login");
    }
})
module.exports=router;