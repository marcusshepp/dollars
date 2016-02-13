from django.views.generic import View
from django.shortcuts import render

from .forms import PicForm
from .models import Pic

class Home(View):

    template_name = "receipt/home.html"

    def get(self, request, *a, **kw):
        context = dict()
        context["form"] = PicForm
        return render(request, self.template_name, context)

    def post(self, request, *a, **kw):
        context = dict()
        print "request.POST: ", request.POST
        print "request.FILES: ", request.FILES
        f = PicForm(request.POST, request.FILES)
        context["form"] = f
        if f.is_valid():
            print "valid"
            new_picture = Pic(docfile=request.FILES["docfile"])
            new_picture.save()
            print new_picture.__unicode__()
        return render(request, self.template_name, context)

class PicsView(View):

    template_name = "receipt/pics.html"

    def get(self, request, *a, **kw):
        p = Pic.objects.all()[0]
        context["pic"] = p
        return render(request, self.template_name, context)
