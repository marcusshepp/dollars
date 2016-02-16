from django import forms

class PicForm(forms.Form):
    docfile = forms.FileField(label='Select a file',)

