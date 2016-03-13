echo "reseting receipt app.."
rm db.sqlite3
python manage.py migrate
echo "done"