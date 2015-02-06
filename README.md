# speedlogger
speedlogger for raspberry pi

Description
-----------

Un nouvelle version de mon tachymetre pour le vélo, basé sur un Raspberry Pi.

Pour l'installer, simplement faire un git clone de ce repository.

Pour lancer le programme faire :
sudo pyhton speedlogger.py

Installer sqlite3 et créer une base de données dans le meme répertoire

sudo apt-get install sqlite3
sqlite3 logger.db
>>begin;
>>create table speeds (timestamp datetime, speed numeric);
>>commit;
>>.quit

installer node

wget http://node-arm.herokuapp.com/node_latest_armhf.deb 
sudo dpkg -i node_latest_armhf.deb

node -v
node app.js
npm install sqlite3
npm install https://github.com/mapbox/node-sqlite3/tarball/master
npm install express


