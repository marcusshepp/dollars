gunicorn wsgi:application --pid /tmp/dollars-gunicorn.pid --bind unix:/tmp/dollars-gunicorn.sock --workers 3 --name dollars-gunicorn --daemon
# run from /opt/dollars/dollars
