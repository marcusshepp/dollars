from django import forms
from django.contrib.auth.models import User
from django.forms.widgets import PasswordInput


class LoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget=PasswordInput)


class RegisterationForm(forms.ModelForm):
    password_two = forms.CharField(
        max_length=100,
        label='Verify Password',
        widget=forms.PasswordInput
        )

    class Meta:
        model = User
        fields = ('username', 'password', 'password_two')
        widgets = {
            'password': forms.PasswordInput(),
        }

    def clean_password_two(self):
        one = self.cleaned_data['password']
        two = self.cleaned_data['password_two']
        if one != two:
            raise forms.ValidationError("Password fields must match.")

    def save(self, commit=True):
        user = super(RegisterationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user
