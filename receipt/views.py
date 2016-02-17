from django.shortcuts import render
from django.http import JsonResponse
from django.views.generic import TemplateView, View

from .forms import PicForm, ItemForm
from .models import Pic, Item


class Home(TemplateView):

    template_name = "receipt/form.html"

    def get(self, request, *a, **kw):
        context = dict()
        context["form"] = PicForm
        return render(request, self.template_name, context)

    def post(self, request, *a, **kw):
        context = dict()
        f = PicForm(request.POST, request.FILES)
        context["form"] = f
        if f.is_valid():
            new_picture = Pic(docfile=request.FILES["docfile"])
            new_picture.save()
        return render(request, self.template_name, context)


class PicsView(TemplateView):

    template_name = "receipt/pics.html"

    def get(self, request, *a, **kw):
        super(PicsView, self).get(request, *a, **kw)
        p = Pic.objects.all()[0]
        context["pic"] = p
        return render(request, self.template_name, context)


class ItemView(TemplateView):

    template_name = "receipt/item.html"

    def get(self, request, *a, **kw):
        super(ItemView, self).get(request, *a, **kw)
        context = dict()
        context["form"] = ItemForm
        context["items"] = Item.objects.all()
        return render(request, self.template_name, context)
    
    def post(self, request, *a, **kw):
        context = dict()
        form = ItemForm(request.POST)
        if form.is_valid():
            form.save()
        return self.get(request, *a, **kw) # cool


class ItemEndPoint(View):
    
    def get(self, request, *a, **kw):
        items = Item.objects.all()
        data = dict()
        data["names"] = [i.name for i in items]
        data["companies"] = [i.company_came_from for i in items]
        data["prices"] = [i.price for i in items]
        data["length"] = items.count()
        return JsonResponse(data)