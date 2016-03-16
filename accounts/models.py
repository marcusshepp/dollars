from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


# class UserExtention(User):
# 	""" Extend Django's User model. """
# 	
# 	user = models.OneToOneField(User, on_delete=models.CASCADE)
# 
# 	def save(self, *args, **kwargs):
# 		super(UserMapping, self).save(*args, **kwargs)