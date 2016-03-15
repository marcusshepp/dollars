from django import forms

from .models import (
    Item,
    Action,
    Purchase,
    )


class ItemForm(forms.ModelForm):

    class Meta:
        model = Item
        fields = ["name", "company_came_from", "price", "catagory"]


class ActionForm(forms.ModelForm):

    class Meta:
        model = Action
        fields = ["title", "object_name", "undo_handler"]


class PurchaseForm(forms.ModelForm):

    class Meta:
        model = Purchase
        fields = ["amount_payed", "item_purchased"]
