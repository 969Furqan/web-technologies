const express = require("express");
let server = express();
server.get("/", function(req, res){
    res.send({ name: "furqan", age: "21" });
});
server.listen(3000);