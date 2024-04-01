const express = require("express");
let server = express();
server.set("view engine","ejs");
server.use(express.static("public"));
server.get("/restful", function(req,res){
    res.render("restful");
})
server.get("/", function(req,res){
    res.render("index");
})
server.get("/contact-us", function(req,res){
    res.render("contact-us");
})

server.listen(3000);


//cant open mic, keep watching.......