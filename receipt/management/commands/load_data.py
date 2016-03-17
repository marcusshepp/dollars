import os
import csv
import random
import requests
from datetime import date
from itertools import chain

from django.core.management.base import BaseCommand
from django.core import serializers
from django.contrib.auth.models import User

from receipt.models import (
    Purchase,
    Item,
    Catagory,
    Action,
    Start,
    WhatPage,
)


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('args')
        parser.add_argument('third_arg')
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
            if options.get("third_arg", None):
                num = int(options["third_arg"])
            else: num = 10
            # create catagories
            catagory_names = gen_names(paragraph_tags, num)
            catagories = [Catagory.objects.get_or_create(name=name)[0] for name in catagory_names]
            # create items
            items = create_items(gen_names(paragraph_tags, num),
                                 gen_names(paragraph_tags, num),
                                 [random.randrange(0, 100) for x in range(num)],
                                 [catagory.id for catagory in catagories],
                                 num)
            # create purchases
            purchases = [
                Purchase.objects.get_or_create(
                    item_purchased=random.choice(items)[0],
                    amount_payed=random.randrange(0, 100)) for _ in xrange(random.randrange(10, 25))]
            print "{} Items have been created.".format(len(items))
            print "{} Purchases have been created.".format(len(purchases))
            print "{} Catagories have been created.".format(len(catagories))
        elif arg == "export":
            print "Exporting..."
            """
            Writes Items + Catagories + Purchases to a file in XML.
            ex: m load_data export <file name>
            """
            file_name = options.get("third_arg", None)
            if file_name:
                if type(file_name) == str: # pointless str test?
                    path = os.path.join("receipt/data/", file_name)
                    items = Item.objects.all()
                    catagories = Catagory.objects.all()
                    purchases = Purchase.objects.all()
                    # actions = Actions.objects.all()
                    chained_query = list(chain(items, catagories, purchases))
                    XMLSerializer = serializers.get_serializer("xml")
                    xml_serializer = XMLSerializer()
                    with open(path+".xml", 'w') as out:
                        xml_serializer.serialize(chained_query, stream=out)
        elif arg == "import":
            print "importing..."
            file_name = options.get("third_arg", None)
            if file_name:
                if type(file_name) == str: # pointless str test?
                    path = os.path.join("receipt/data/", file_name)
                    with open(path+".xml", 'r') as out:
                        for objec in serializers.deserialize("xml", out):
                            objec.save()
        elif arg == "delete":
            print "deleting..."
            [i.delete() for i in Purchase.objects.all()]
            [i.delete() for i in Catagory.objects.all()]
            [i.delete() for i in Item.objects.all()]
            [i.delete() for i in Action.objects.all()]
            [i.delete() for i in Start.objects.all()]
            [i.delete() for i in WhatPage.objects.all()]
            [i.delete() for i in User.objects.all()]
        else: print "use args -- `import` or `export`"


def create_items(names, companies_came_from, prices, catagory_ids, num):
    items = list()
    for i in range(num):
        data = dict()
        item_that_might_already_be_created = Item.objects.filter(name=names[i])
        if item_that_might_already_be_created.exists() and not str(names[i]).contains("/>"):
            break
        else:
            data["name"] = names[i]
            data["company_came_from"] = companies_came_from[i]
            data["price"] = prices[i]
            catagory = Catagory.objects.get(id=catagory_ids[i])
            data["catagory"] = catagory
            item = Item.objects.get_or_create(**data)
            items.append(item)
    return items

def gen_names(text, num):
    """
    Generates string input for CharField's.
    """
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
