#!/usr/bin/python
import time
import RPi.GPIO as GPIO
import sqlite3

dbname = 'logger.db'

WHEEL_CIRCUMFERENCE = 2.114 #circonference of the wheel in meter
LOGGING_INTERVAL = 5 # logging interval to database in seconds

lastState = False 
lastTime = time.time()
lastLog = time.time()
currTime = lastTime
cumulDist = 0
startTime = 0
outStr = ""

# setup the pins on the raspberry pi
GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)
GPIO.setup(11,GPIO.IN)  # pin for signal from reed switch
GPIO.setup(12,GPIO.OUT) # pin for the LED

# rappeler au cycliste de mettre la tension sur la roue
print " "
print "------------------------------ "
print "Mettre la roue sous tension"
print "------------------------------ "
print "Entrainement du ",time.ctime()

#setup le debut de session
startTime = time.time()

while True:
  currState = GPIO.input(11)
  if currState and not lastState : #if we pass from low to high
    currTime = time.time()
    dt = currTime-lastTime
    currSpeed = (WHEEL_CIRCUMFERENCE*3600/1000)/dt  # WHEEL_CIRCUMFERENCE * 3600s/h / 1000 m/km --> km/h
    cumulDist += WHEEL_CIRCUMFERENCE
    
    #output strings
    timeStr = "{:4.2f}".format((currTime-startTime)/60)+" min. "  #this is time for this session
    distanceStr = "{:4.2f}".format(cumulDist/1000)+" km "
    speedStr = "{:4.1f}".format(currSpeed)+" km/h "
    # voir http://www.siafoo.net/snippet/88 pour les code de couleurs
    if currSpeed < 20 :
      speedColorStr = "\033[1;43m"
    else :
      speedColorStr = "\033[1;42m"
    meanSpeedStr = "{:4.2f}".format((cumulDist)/(currTime-startTime))+" m/s "
    outStr = speedColorStr +speedStr + "\033[1;m" + meanSpeedStr + timeStr + distanceStr
    print outStr

    # CREATE TABLE speeds (timestamp DATETIME, speed NUMERIC);
    if currTime-lastLog > LOGGING_INTERVAL :
      print "LOGGING...." + speedStr
      lastLog = currTime
      conn=sqlite3.connect(dbname)
      curs=conn.cursor()
      curs.execute("INSERT INTO speeds values(datetime('now','localtime'), (?))", (currSpeed,))
      conn.commit()
      conn.close()
      GPIO.output(12,False) # blink the LED
      time.sleep(0.02)
      GPIO.output(12,True)
# end if
  lastState = currState
  lastTime = currTime
  time.sleep(0.0001)
#end while
