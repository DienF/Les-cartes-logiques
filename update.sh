for s in $( screen -ls | grep -o -P "\d\d\d\d\d*"); do screen -X -S $s quit;done;
git reset --hard
git pull
rm -R flask/static
rm -R flask/templates/*
cd react
npm run build
cp -R build/static ../flask
sed 's/\/static/static/g' build/index.html > ../flask/templates/index.html
cp -R build/*.json ../flask/templates
cp -R build/* ../flask/static
rm -r build/*
cd ..
cd flask
screen -d -m sudo python server.py
