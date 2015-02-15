#!/bin/bash
echo "Start of speedlogger"
sudo python speedlogger.py& 
echo "Start of web api"
sudo node app.js& 
echo "Vous pouvez maintenant continuer a travailler"
