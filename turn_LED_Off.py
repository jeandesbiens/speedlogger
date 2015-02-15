#!/usr/bin/python
import RPi.GPIO as GPIO

# script for turning the LED off in case the logger crash/stop when its on
#
# setup the pins on the raspberry pi
GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)
GPIO.setup(12,GPIO.OUT) # pin for the LED on the speedometer connector
# setting the pin to True turns the LED off
GPIO.output(12,True)