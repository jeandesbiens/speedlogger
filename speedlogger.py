#!/usr/bin/python
import time
import RPi.GPIO as GPIO
import sqlite3

GPIO.setmode(GPIO.BOARD)

dbname = 'logger.db'

lastState = False
lastTime = time.time()
currTime = lastTime
cumulDist = 0
startTime = 0
outStr = ""

# setup the pins on the raspberry pi
GPIO.setwarnings(False)
GPIO.setup(11,GPIO.IN)  # pin for signal from reed switch
GPIO.setup(12,GPIO.OUT) # pin for the LED

# rappeler au cycliste de mettre la tension sur la roue
print "------------------------------ "
print "Mettre la roue sous tension"
print "------------------------------ "
print "Entrainement du ",time.ctime()

#setup le début de session
startTime = time.time()
 # CREATE TABLE speeds (timestamp DATETIME, speed NUMERIC);
conn=sqlite3.connect(dbname)
curs=conn.cursor()

while True:
  currState = GPIO.input(11)
  if currState and not lastState : 
    #if we pass from low to high
    currTime = time.time()
    dt = currTime-lastTime
    currSpeed = 7.6104/dt  
    #2.114m de circonference * 3600s/h / 1000 m/km
    cumulDist += 2.114
    #output facile pour import dans Excel
    timeStr = "{:4.2f}".format((currTime-startTime)/60)+" min. "
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
    # storing data to database
    #curs.execute("INSERT INTO speeds values(datetime('now'), (?))", (currSpeed,))
    # commit the changes
    #conn.commit()
    # end of storing data to database

 #   GPIO.output(12,False)
 #   time.sleep(0.05)
 #   GPIO.output(12,True)
  else :
   # print "."
 #   GPIO.output(12,True)
  lastState = currState
  lastTime = currTime
  time.sleep(0.001)

 conn.close()
