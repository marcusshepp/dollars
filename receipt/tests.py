from django.test import TestCase

from .models import Item


class ReceiptTests(TestCase):
    
    def setUp(self):
        pass
    
    def test_init_items(self):
        """ tests that the initial items created in the migration file actually exist. """
        coffee = Item.objects.get(name="Coffee")
        self.assertTrue(coffee)
        if self.assertTrue(coffee):
            print "Item: Coffee, exists."
