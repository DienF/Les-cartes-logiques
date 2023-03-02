for s in $( screen -ls | grep -o -P "\d\d\d\d\d*"); do screen -X -S $s quit;done;
git reset --hard
git pull
cd flask
screen -d -m sudo python server.py
cd ..
cd react
screen -d -m sudo PORT=80 npm start