from __future__ import unicode_literals

from django.db import models


class Action(models.Model):

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

    def latest_action(self):
        return self.objects.all().order_by('-id')[0]


class Pic(models.Model):

    class Meta:
        pass

    title = models.CharField(max_length=100)
    docfile = models.FileField(upload_to="pics/")

    def __unicode__(self):
        return u"{}".format(self.title)

#
# class Receipt(models.Model):
#
#     name_of_company = models.CharField(max_length=50)
#

class Purchase(models.Model):

    class Meta:
        ordering = ["-date_created"]

    date_created = models.DateTimeField(auto_now_add=True)
    item_purchased = models.ForeignKey("Item")

    def date_display(self):
        return self.date_created.strftime("%b. %d, %Y, %-I:%M %p")


class Item(models.Model):

    class Meta:
        ordering = ["-date_created"]
        unique_together = ("name", "company_came_from")

    date_created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=250)
    company_came_from = models.CharField(max_length=50, null=True, blank=True)
    price = models.DecimalField(max_digits=19, decimal_places=2)
    number_of_times_purchased = models.IntegerField(null=False, blank=True, default=0)

    def __unicode__(self):
        return u"{0} - {1}".format(self.name, self.company_came_from)

    def date_display(self):
        return self.date_created.strftime("%b. %d, %Y, %-I:%M %p")

    def decrement_number_of_times_purchased(self):
        self.number_of_times_purchased = models.F("number_of_times_purchased") + 1
        return 1

class Budget(models.Model):

    date_created = models.DateTimeField(auto_now_add=True)
    monthly_paycheck = models.DecimalField(max_digits=19, decimal_places=2)
    monthly_saving_desired = models.DecimalField(max_digits=19, decimal_places=2)
