for s in $( screen -ls | grep -o -P "\d\d\d\d\d*"); do screen -X -S $s quit;done;
git reset --hard
git pull
cd react
npm run build
mv build/static ../flask
sed 's/\/static/static/g' build/index.html > ../flask/templates/index.html
mv build/*.json ../flask/templates
mv build/* ../flask/static
cd ..
cd flask
screen -d -m sudo python server.py
