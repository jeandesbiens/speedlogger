#!/bin/bash
echo "Stopping speedlogger"
sudo kill `ps axu |grep speedlogger|head -n 1|cut -c 10-14`
echo "Done killing speedlogger, next line should not show speedlogger, except for grep"
ps axu|grep speedlogger --color=auto

