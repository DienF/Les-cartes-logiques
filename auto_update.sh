while [ 1 ]
do
    git fetch > /dev/null
    output_git=$(git status -uno)
    ouput_screen=$(screen -ls)
    if [[$output_git == *""* || $ouput_screen == *"found"*]]
    then 
        killall screen
        git reset --hard
        git pull
        cd react
        rm -r build
        npm run build
        cd ../flask
        screen -d -m sudo python server.py
        cd ..
    fi
    sleep 5
done

