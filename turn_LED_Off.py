#!/usr/bin/python
import RPi.GPIO as GPIO

# setup the pins on the raspberry pi
GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)
GPIO.setup(12,GPIO.OUT) # pin for the LED
GPIO.output(12,false)