from __future__ import unicode_literals

from django.db import models
from django.core.validators import MinLengthValidator
from django.contrib.auth.models import User


class TiedToUser(models.Model):
    class Meta:
        abstract = True
    user = models.ForeignKey(User)


class Action(TiedToUser):

    class Meta:
        pass

    handler_options = (
        ("undo add item", "Undo Add Item"),
        ("undo purchase", "Undo Purchase"),
    )
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=1000, null=True)
    object_name = models.CharField(max_length=25, null=True)
    undo_handler = models.CharField(max_length=25, null=True, choices=handler_options)

    def __unicode__(self):
        return "{}".format(self.title)

    @classmethod
    def latest_action(cls):
        objs = Action.objects.all()
        if objs:
            return objs.order_by('-id')[0]


class Purchase(TiedToUser):

    class Meta:
        ordering = ["-date_created"]

    date_created = models.DateTimeField(auto_now_add=True)
    item_purchased = models.ForeignKey("Item")
    amount_payed = models.DecimalField(max_digits=19, decimal_places=2)

    def date_display(self):
        return self.date_created.strftime("%b. %d, %Y, %-I:%M %p")


class Item(TiedToUser):

    class Meta:
        ordering = ["-date_created"]
        unique_together = ("name", "where_from", "catagory")

    date_created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=15, unique=True, validators=[MinLengthValidator(4)])
    where_from = models.CharField(max_length=10, null=True, blank=True)
    price = models.DecimalField(max_digits=19, decimal_places=2)
    number_of_times_purchased = models.IntegerField(null=False, blank=True, default=0)
    catagory = models.ForeignKey("Catagory")

    def __unicode__(self):
        string = u"{}".format(self.name)
        if self.where_from:
            string += u" from {}".format(self.where_from)
        return string

    def date_display(self):
        return self.date_created.strftime("%b. %d, %Y, %-I:%M %p")

    def increase_number_of_times_purchased(self):
        num_of_times_purchased_before = self.number_of_times_purchased
        self.number_of_times_purchased = models.F("number_of_times_purchased") + 1
        self.save()
        if num_of_times_purchased_before + 1 == self.number_of_times_purchased:
            return 1

    def decrement_number_of_times_purchased(self):
        num_of_times_purchased_before = self.number_of_times_purchased
        self.number_of_times_purchased = models.F("number_of_times_purchased") - 1
        self.save()
        if num_of_times_purchased_before + 1 == self.number_of_times_purchased:
            return 1


class Catagory(TiedToUser):

    class Meta:
        ordering = ["name"]

    date_created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=25, validators=[MinLengthValidator(4)])

    def __unicode__(self):
        return u"{0}".format(self.name)

    def string(self):
        return unicode(self.__unicode__()).upper()

    def has_a_purchase(self, user):
        for purchase in Purchase.objects.filter(user_id=user.id):
            if self.name == purchase.item_purchased.catagory.name:
                return True


class Start(models.Model):
    """
    Is this the start of the application?
    """
    is_start_of_app = models.BooleanField(default=False)


class WhatPage(TiedToUser):
    """
    Where was the User looking last?
    """
    MODEL_CHOICES = (
        ("item", "item"),
        ("purchase", "purchase"),
    )
    obj = models.CharField(max_length=15, choices=MODEL_CHOICES, unique=True)
    page_number = models.IntegerField()
    number_per_page = models.IntegerField()

    def __unicode__(self):
        return u"{0}-{1} per page, page number {2}".format(self.obj, self.number_per_page, self.page_number)

    def decrement_page_number(self):
        page_number = self.page_number
        if page_number == 1:
            return
        else:
            self.page_number = models.F("page_number") - 1
            self.save()
            if page_number - 1 == self.page_number:
                return 1

    def increase_page_number(self):
        page_number = self.page_number
        self.page_number = models.F("page_number") + 1
        self.save()
        if page_number + 1 == self.page_number:
            return 1

    def change_number_per_page(self, number_per_page):
        if number_per_page >= 5:
            self.number_per_page = number_per_page
            self.save()
