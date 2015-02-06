

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('logger.db');
 
db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS counts (key TEXT, value INTEGER)");
    db.run("INSERT INTO counts (key, value) VALUES (?, ?)", "counter", 0);
});
 
 
 
var express = require('express');
var restapi = express();
 
restapi.get('/data', function(req, res){
    db.each("SELECT * FROM speeds", function(err, row){
        res.json(row);
    });
});
 
restapi.post('/data', function(req, res){
    db.run("UPDATE counts SET value = value + 1 WHERE key = ?", "counter", function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.status(202);
        }
        res.end();
    });
});
 
 
restapi.listen(1337, '192.168.1.104');
 
console.log("Submit GET or POST to http://192.168.1.104:1337/data");
