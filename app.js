var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('logger.db');
 
var express = require('express');
var restapi = express();
 
restapi.get('/', function(req, res){
  db.get("SELECT * FROM speeds ORDER BY timestamp DESC LIMIT 1", function(err, row){
  	if (err){
            console.error("ERROR detected at / endpoint : "+err);
            res.status(500);
        }
        else {
             res.send('<!DOCTYPE html>'+
'<html>'+
'    <head>'+
'        <meta charset="utf-8" />'+
'		 <meta http-equiv="refresh" content="1">'+
'        <title>Tachymetre!</title>'+
'    </head>'+ 
'    <body>'+
'     	<p>'+row.speed+'</p>'+
'    </body>'+
'</html>');
        console.log("/ endpoint has been called, returning data : "+row.speed);
        }
    });
  db.close()
});

restapi.get('/data', function(req, res){
	console.log("/data endpoint has been called");
    db.all("SELECT * FROM speeds", function(err, rows){
        res.json(rows)
    });
});
 
restapi.post('/data', function(req, res){
    db.run("UPDATE counts SET value = value + 1 WHERE key = ?", "counter", function(err, row){
        if (err){
            console.error(err);
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
