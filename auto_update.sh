while 1
do
    if git status -uno | grep behind > /dev/null || screen -ls | grep "found" > /dev/null
    then 
        for s in $( screen -ls | grep -o -P "\d\d\d\d\d*")
        do 
            screen -X -S $s quit
        done;
        git reset --hard
        git pull
        cd react
        rm -r build
        npm run build
        cd ../flask
        screen -d -m sudo python server.py
    fi
done

