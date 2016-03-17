echo $1
if [[ $1 -eq "no-boot" ]]; then
    echo "deleting all data w/o booting server..."
    python manage.py load_data delete foo
else
    echo "deleting all data + booting server..."
    python manage.py load_data delete foo
    bash ~/projects/dollars/as/django/bootserver.sh
fi
