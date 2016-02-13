from __future__ import unicode_literals

from django.db import models

class Pic(models.Model):

    class Meta:
        pass

    docfile = models.FileField(upload_to="pics/")

    def __unicode__(self):
        return u"HELLO WORLD UNICODE"

# 
# class Receipt(models.Model):
#
#     name_of_company = models.CharField(max_length=50)
#
