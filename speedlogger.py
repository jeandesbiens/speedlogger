#!/usr/bin/python
import time
import RPi.GPIO as GPIO
from termcolor import colored

GPIO.setmode(GPIO.BOARD)

lastState = False
lastTime = time.time()
currTime = lastTime
cumulDist = 0
startTime = 0
outStr = ""

GPIO.setwarnings(False)
GPIO.setup(11,GPIO.IN)
GPIO.setup(12,GPIO.OUT)

print "------------------------------ "
print "Mettre la roue sous tension"
print "------------------------------ "
print "Temps (m), Distance (km), Vitesse (km)"
startTime = time.time()

print "Entrainement du ",time.ctime()
f = open('out.txt','w')
f.write(time.ctime()+"\n")
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
    meanSpeedStr = "{:4.1f}".format((cumulDist)/(currTime-startTime))+" m/s "
    outStr = colored(speedStr,'green') + meanSpeedStr + timeStr + distanceStr
    print outStr
    f.write(outStr+"\n") #print to file
    GPIO.output(12,False)
    time.sleep(0.05)
    GPIO.output(12,True)
  else :
   # print "."
    GPIO.output(12,True)
  lastState = currState
  lastTime = currTime
  time.sleep(0.001)

f.close()