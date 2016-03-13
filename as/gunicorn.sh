NAME=dollars
SETTINGS=dollars.settings
SOCK=/opt/proc/dollars-gunicorn.sock
PID=/opt/proc/dollars-gunicorn.pid
LOGFILE=/opt/proc/dollars-gunicorn.log
WORKERS=3


echo 'Creating Daemon process for: '$NAME
echo 'LOGFILE: '$LOGFILE


gunicorn \
    --env DJANGO_SETTINGS_MODULE=$SETTINGS \
    dollars.wsgi:application \
    --pid $PID \
    --bind unix:$SOCK \
    --workers $WORKERS \
    --name $NAME \
    --daemon \
    --log-file=$LOGFILE

# run from /opt/dollars
