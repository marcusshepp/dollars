import os
import csv
import random
import requests
from datetime import date

from django.core.management.base import BaseCommand

from receipt.models import (
    Purchase,
    Item,
    Catagory,
    Action,
    Pic,
    Budget,
)


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('args')
        # parser.add_argument('args')
        # r = requests.get()

    def handle(self, *args, **options):
        print "Hi, Marcus Shepherd.\nWelcome the Load Data management command."
        arg = "".join([i for i in args])
        if arg == "create":
            print "Creating..."
            lorem = "http://loripsum.net/api/10/short/headers"
            request = requests.get(lorem)
            text = request.text.split("\n")
            paragraph_tags = [line for line in text if "<p>" in line]
            num = 2
            catagory_names = gen_names(paragraph_tags, num)
            catagories = [Catagory.objects.get_or_create(name=name)[0] for name in catagory_names]
            items = create_items(gen_names(paragraph_tags, num),
                                 gen_names(paragraph_tags, num),
                                 [random.randrange(0, 100) for x in range(num)],
                                 [catagory.id for catagory in catagories],
                                 num)
            print items

        elif arg == "import":
            print "importing..."

            # games = Game.objects.all()
            # file_name = "quick-games-{}.csv".format(date.today())
            # path = os.path.join("match/fixtures/", file_name)
            # with open(path, 'w') as f:
            # 	try:
            # 		writer = csv.writer(f)
            # 		for g in games:
            # 			writer.writerow(
            # 				(g.user_played, g.enemy_laner, g.enemy_jungler, g.winner, g.date_played, g.note))
            # 	finally:
            # 		f.close()
            # print path
        elif arg == "export":
            print "Exporting..."
            # try:
            # 	path = args[1]
            # 	with csv.reader(str(path)) as f:
            # 		for row in f:
            # 			game = {}
            # 			game["user_played"] = row[0]
            # 			game["enemy_laner"] = row[1]
            # 			game["enemy_jungler"] = row[2]
            # 			game["winner"] = row[3]
            # 			game["date_played"] = row[4]
            # 			game["note"] = row[4]
            # 			Game.objects.create(**game)
            # except IndexError:
            # 	print "provide path to data"
        else: print "use args -- `import` or `export`"


def create_items(names, companies_came_from, prices, catagory_ids, num):
    items = list()
    for i in range(num):
        data = dict()
        data["name"] = names[i]
        data["company_came_from"] = companies_came_from[i]
        data["price"] = prices[i]
        catagory = Catagory.objects.get(id=catagory_ids[i])
        data["catagory"] = catagory
        item = Item.objects.get_or_create(**data)
        items.append(item)
    return items

def gen_names(text, num):
    names = list()
    for i in range(num):
        para_index = random.randrange(1, len(text)-1)
        para_inner_index_left = random.randrange(1, len(text[para_index])-1)
        para_inner_index_right = random.randrange(para_inner_index_left, len(text[para_index])-1)
        before_shortener = text[para_index][para_inner_index_left:para_inner_index_right]
        name = ""
        name += before_shortener
        names.append(name)
    return names
