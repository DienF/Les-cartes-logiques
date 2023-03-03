while [ 1 ]
do
    git fetch > /dev/null
    output_git=$(git status -uno)
    ouput_screen=$(screen -ls)
    echo output_git > /home/ubuntu/output_git.log
    echo output_screen > /home/ubuntu/output_screen.log
    if [[$output_git == *""* || $ouput_screen == *"server"*]]
    then 
        screen -X -S server quit
        git reset --hard
        git pull
        cd react
        rm -r build
        npm run build
        cd ../flask
        screen -S server -d -m sudo python server.py
        cd ..
    fi
    sleep 5
done

