#!/usr/bin/python
import time
import RPi.GPIO as GPIO

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
    outStr = "{:4.3f}".format((currTime-startTime)/60)+","+"{:4.3f}".format(cumulDist/1000)+","+"{:4.1f}".format(currSpeed)
    print "{:4.1f}".format(currSpeed)       #display
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