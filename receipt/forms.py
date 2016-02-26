from django import forms

from .models import Item, Action


class PicForm(forms.Form):

    docfile = forms.FileField(label='Select a file',)


class ItemForm(forms.ModelForm):

    class Meta:
        model = Item
        fields = ["name", "company_came_from", "price", "catagory"]


class ActionForm(forms.ModelForm):

    class Meta:
        model = Action
        fields = ["title", "object_name", "undo_handler"]
