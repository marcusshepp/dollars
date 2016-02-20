echo "remaking migrations for receipt.."
echo "**before**"
ls receipt/migrations
rm -rf receipt/migrations/0001*
echo "**removing**"
ls receipt/migrations
python manage.py makemigrations
echo "**makemigrations**"
ls receipt/migrations
