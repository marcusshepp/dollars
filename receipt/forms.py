from django import forms

from .models import (
    Item,
    Action,
    Purchase,
    Catagory,
    )


class ItemForm(forms.ModelForm):

    class Meta:
        model = Item
        fields = ["name", "company_came_from", "price", "catagory", "user"]


class ActionForm(forms.ModelForm):

    class Meta:
        model = Action
        fields = ["title", "object_name", "undo_handler", "user"]


class PurchaseForm(forms.ModelForm):

    class Meta:
        model = Purchase
        fields = ["amount_payed", "item_purchased", "user"]


class CatagoryForm(forms.ModelForm):

    class Meta:
        model = Catagory
        fields = ["name", "user"]
