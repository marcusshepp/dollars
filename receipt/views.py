from django.views.generic import View
from django.shortcuts import render

from .forms import PicForm
from .models import Pic

class Home(View):

    template_name = "receipt/home.html"

    def get(self, request, *a, **kw):
        return render(request, self.template_name, {})

    def post(self, request, *a, **kw):

        print "POSTED"

        f = PicForm(request.POST, request.FILES)
        if f.is_valid():
            new_picture = Pic(ff=request.FILES["ff"])
            new_picture.save()
        return render(request, self.template_name, {})

class PicsView(View):

    template_name = "receipt/pics.html"

    def get(self, request, *a, **kw):
        p = Pic.objects.all()[0]
        context["pic"] = p
        return render(request, self.template_name, context)
