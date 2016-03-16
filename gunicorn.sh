NAME=dollars
SETTINGS=dollars.settings
SOCK=/opt/proc/dollars-gunicorn.sock
PID=/opt/proc/dollars-gunicorn.pid
LOGFILE=/opt/proc/dollars-gunicorn.log
WORKERS=3


echo 'Creating Daemon process for: '$NAME
echo 'LOGFILE: '$LOGFILE


DIRECT=/opt/proc/
if ! [[ -d $DIRECT ]]; then
    ls -la /opt/
    echo $DIRECT" does not exist.. creating.."
    sudo mkdir $DIRECT
    ls -la /opt/
fi


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



# /etc/nginx/sites-enabled/default
# upstream app_server {
# 	server unix:/opt/proc/mysite-gunicorn.sock;
# }
# 
# server {
# 
#         listen 9000;
# 
#         access_log /var/log/nginx/access.log;
#         error_log /var/log/nginx/error.log;
# 
# 	location / {
# 		proxy_pass http://app_server;
# 	}
# 
#         location /media {
#             root /opt/media;
#         }
# 
#         location /static {
#             root /opt/static;
# 	}
# }