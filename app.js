var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('logger.db');
 
var express = require('express');
var restapi = express();

function toDate(dateString){
	reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/g;
	dateArray = reggie.exec(dateString); 
	thisDate = new Date(
	    (+dateArray[1]),
	    (+dateArray[2])-1, // Careful, month starts at 0!
	    (+dateArray[3]),
	    (+dateArray[4]),
	    (+dateArray[5]),
	    (+dateArray[6])
	);
	return thisDate;
};

var lastKnownSpeed = 0;
var firstRecordFound = false;
var sessionStartTime;
var lastTime;
var cumulDistance = 0.0;

restapi.get('/', function(req, res){
  db.get("SELECT * FROM speeds ORDER BY timestamp DESC LIMIT 1", function(err, row){
  	if (err){
  		//console.error("ERROR detected at / endpoint : "+err);
  	}
  		else {
  			lastKnownSpeed = row.speed;
  		}
    res.send('<!DOCTYPE html>'+
		'<html>'+
		'    <head>'+
		'        <meta charset="utf-8" />'+
		'		 <meta http-equiv="refresh" content="5">'+
		'        <title>Tachymetre!</title>'+
		'    </head>'+ 
		'    <body>'+
		'     	<p>'+lastKnownSpeed+'</p>'+
		'    </body>'+
		'</html>');
        //console.log("/ endpoint has been called, returning data : "+lastKnownSpeed.toFixed(1)+" km/h");
    });
});

restapi.get('/speed', function(req, res){
	console.log("/speed endpoint has been called");
     db.get("SELECT * FROM speeds ORDER BY timestamp DESC LIMIT 1", function(err, row){
        res.json(row)
    });
});

restapi.get('/stats', function(req, res){
	console.log("/stats endpoint has been called");
     db.all("select * from speeds where dateTime(timestamp) > date('now','-2 day')", function(err, rows){
     	rows.forEach(function (row) {  
     		// handle the first row that gives us the start time of the session
     		if (firstRecordFound == false) {
     			firstRecordFound = true;
     			sessionStartTime = row.timestamp;
     			lastTime = row.timestamp;
     			console.log ('Session started at : '+ sessionStartTime);
     		}
     		else { // this is not the first row
     			// compute distance as the product of speed over time interval
     			var dt = toDate(row.timestamp)-toDate(lastTime); 
     			console.log('row last dt :'+' ' + thisDate+' ' + lastTime+' ' + dt);
     			cumulDistance = cumulDistance + (row.speed * dt);
     			lastTime = row.timestamp;
     		};
        }) ;
        res.json(['sessionStartTime',sessionStartTime, 'cumulDistance',cumulDistance])
    });
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
 
console.log("Submit GET or POST to http://192.168.1.104:1337/stats");
