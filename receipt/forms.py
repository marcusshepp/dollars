from django import forms

from .models import Item


class PicForm(forms.Form):
    
    docfile = forms.FileField(label='Select a file',)


class ItemForm(forms.ModelForm):

    class Meta:
        model = Item
        fields = ["name", "company_came_from", "price"]
