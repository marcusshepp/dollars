from django.shortcuts import render, redirect
from django.views.generic import View
from django.contrib.auth import authenticate, login

from .forms import RegisterationForm, LoginForm


class Login(View):
    def get(self, request, *a, **kw):
        context = dict()
        context["form"] = LoginForm
        return render(request, "accounts/login.html", context)
    def post(self, request, *a, **kw):
        print "form is POSTED"
        form = LoginForm(request.POST)
        if form.is_valid:
            print "form is valid"
            print "USERNAME: ", request.POST.get('username', None)
            print "PASSWORD: ", request.POST.get('password', None)
            user = authenticate(
            username=request.POST.get('username', None),
            password=request.POST.get('password', None)
            )
            print "USER: ", user
            if user is not None:
                if user.is_active:
                    login(request, user)
                    user.is_authenticated = True
                    return redirect('/')
        form = LoginForm
        message = 'User not authenticated'
        return render(
            request, 
            'accounts/register.html', 
            {"message": message, "form": form})


class Registeration(View):
    
    def get(self, request, *a, **kw):
        context = dict()
        context["form"] = RegisterationForm
        return render(request, "accounts/register.html", context)
        
    def post(self, request, *a, **kw):
        form = RegisterationForm(request.POST)
        context = dict()
        if form.is_valid:
            form.save()
            return redirect("/")
        else:
            context["invalid"] = True
            return render(request, "accounts/login.html", context)