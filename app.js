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
var lastRecordedSpeed = 0.0;

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
		'		 <meta http-equiv="refresh" content="30">'+
		'        <title>Tachymetre!</title>'+
		'		<script src="//code.jquery.com/jquery-1.11.2.min.js"></script>'+
		'		<script>'+
		'		$.ajax("http://192.168.1.104:1337/stats", {method: "GET"}).then(function(data) {console.log(data);});'+
		'		</script>'+
		'    </head>'+ 
		'    <body>'+
		'     	<p>'+lastKnownSpeed+'</p>'+

		'    </body>'+
		'</html>');
        //console.log("/ endpoint has been called, returning data : "+lastKnownSpeed.toFixed(1)+" km/h");
    });
});

restapi.get('/dashboard', function(req, res){
	console.log("/dashboard endpoint has been called");
    res.send('<!DOCTYPE html>'+
		'<html>'+
		'    <head>'+
		'        <meta charset="utf-8" />'+
		'		 <meta http-equiv="refresh" content="1000">'+
		'        <title>Tachymetre!</title>'+
		'		<script src="//code.jquery.com/jquery-1.11.2.min.js"></script>'+
		'		<script>'+
		'		$.ajax("http://192.168.1.104:1337/stats", {method: "GET"}).then(function(data) {console.log(data);$("#currSpeed").text(data.lastSpeed);});'+
		'		</script>'+
		'    </head>'+ 
		'    <body>'+
		'     	<p id="currSpeed">speed placeholder</p>'+

		'    </body>'+
		'</html>');
        //console.log("/dashboard endpoint has been called");
});


restapi.get('/speed', function(req, res){
	console.log("/speed endpoint has been called");
     db.get("SELECT * FROM speeds ORDER BY timestamp DESC LIMIT 1", function(err, row){
        res.json(row)
    });
});

restapi.get('/stats', function(req, res){
	console.log("/stats endpoint has been called");
	cumulDistance = 0.0;
     db.all("select * from speeds where dateTime(timestamp) > date('now','-0 day')", function(err, rows){
     	rows.forEach(function (row) {  
     		// handle the first row that gives us the start time of the session
     		if (firstRecordFound == false) {
     			firstRecordFound = true;
     			sessionStartTime = row.timestamp;
     			lastTime = row.timestamp;
     			//console.log ('Session started at : '+ sessionStartTime);
     		}
     		else { // this is not the first row
     			// compute distance as the product of speed over time interval
     			var dt = ((toDate(row.timestamp)-toDate(lastTime))/1000/3600); //delta in ms converted to hour
     			cumulDistance = cumulDistance + (row.speed * dt);
     			//console.log('culmul distance :'+cumulDistance);
     			lastTime = row.timestamp;
     			lastRecordedSpeed = row.speed;
     		};
        }) ;
        res.json(['sessionStartTime',sessionStartTime, 
        	'sessionEndTime',lastTime,
        	'duration',((toDate(lastTime)-toDate(sessionStartTime))/1000/3600),
        	'cumulDistance',cumulDistance,
        	'lastSpeed',lastRecordedSpeed,
        	'averageSpeed',cumulDistance/((toDate(lastTime)-toDate(sessionStartTime))/1000/3600)])
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
