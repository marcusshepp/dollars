gunicorn --env DJANGO_SETTINGS_MODULE=dollars.settings dollars.wsgi:application --pid /opt/dollars-gunicorn.pid --bind unix:/opt/dollars-gunicorn.sock --workers 3 --name dollars-gunicorn --daemon --log-file=/opt/log
# run from /opt/dollars

