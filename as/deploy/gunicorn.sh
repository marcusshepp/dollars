# Generates a Daemon process with Gunicorn.
# Runs on apps built with Django==1.9
# Marcus Shepherd <marcusshepdotcom@gmail.com>

NAME=dollars
SETTINGS=$NAME.settings
SOCK=/opt/proc/$NAME-gunicorn.sock
PID=/opt/proc/$NAME-gunicorn.pid
LOGFILE=/opt/proc/$NAME-gunicorn.log
WORKERS=3


echo 'Creating Daemon process for: '$NAME
echo 'LOGFILE: '$LOGFILE


DIRECT=/opt/proc/
echo "does $DIRECT exist?"
if ! [[ -d $DIRECT ]]; then
    ls -la /opt/
    echo $DIRECT" does not exist.. creating.."
    sudo mkdir $DIRECT
    ls -la /opt/
else
    echo "Yes it does."
    echo "removing /opt/proc/$NAME*"
    rm -rf /opt/proc/$NAME*
fi


gunicorn \
    --env DJANGO_SETTINGS_MODULE=$SETTINGS \
    $NAME.wsgi:application \
    --pid $PID \
    --bind unix:$SOCK \
    --workers $WORKERS \
    --name $NAME \
    --daemon \
    --log-file=$LOGFILE

# run from /opt/dollars


if [[ -e $LOGFILE ]]; then
  cat $LOGFILE;
fi