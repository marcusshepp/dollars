from __future__ import unicode_literals

from django.db import models

class Pic(models.Model):

    class Meta:
        pass

    ff = models.FileField(upload_to="pics/")
