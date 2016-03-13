echo $1
if [[ $1 -eq "no-boot" ]]; then
    echo "deleting all data w/o booting server..."
    bash ~/projects/dollars/as/django/reset_db.sh
else
    echo "deleting all data + booting server..."
    bash ~/projects/dollars/as/django/reset_db.sh
    bash ~/projects/dollars/as/django/bootserver.sh
fi

if [[ $2 -eq "create" ]]; then
    python manage.py load_data create 5
fi
