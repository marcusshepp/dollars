from django.test import TestCase

from .models import Item


class ReceiptTests(TestCase):
    
    def setUp(self):
        pass
    
    def test_init_items(self):
        """ tests that the initial items created in the migration file actually exist. """
        coffee = Item.objects.get(name="Coffee")
        self.assertTrue(coffee)
        tofu = Item.objects.get(name="Tofu")
        self.assertTrue(tofu)
        lunch = Item.objects.get(name="Lunch")
        self.assertTrue(lunch)
        sub = Item.objects.get(name="Veggie Sub")
        self.assertTrue(sub)
        
