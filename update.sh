screen_delete
git reset --hard
git pull
cd flask
screen -d -m sudo python server.py
cd ..
cd react
screen -d -m npm start