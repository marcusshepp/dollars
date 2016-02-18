from django.db.models import F
from django.http import JsonResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, View
from django.views.decorators.csrf import csrf_exempt

from .forms import (
    PicForm,
    ItemForm)
from .models import (
    Pic,
    Item,
    Purchase)


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
        context["purchased_items"] = Purchase.objects.all()
        return render(request, self.template_name, context)

    def post(self, request, *a, **kw):
        context = dict()
        form = ItemForm(request.POST)
        if form.is_valid():
            form.save()
        return self.get(request, *a, **kw) # cool


class ItemEndPoint(TemplateView):

    template_name = "receipt/item.html"

    def get(self, request, *a, **kw):
        items = Item.objects.all()
        data = dict()
        data["id"] = [i.id for i in items]
        data["names"] = [i.name for i in items]
        data["companies"] = [i.company_came_from for i in items]
        data["prices"] = [i.price for i in items]
        data["length"] = items.count()
        data["times_purchased"] = [i.number_of_times_purchased for i in items]
        purchased = Purchase.objects.all()
        data["purchased_items_names"] = [i.item_purchased for i in purchased]
        data["purchased_dates"] = [i.date_created for i in purchased]
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        item = Item.objects.get(id=request.POST["id"])
        print 'before purchase: ', item.number_of_times_purchased
        item.number_of_times_purchased = F("number_of_times_purchased") + 1
        item.save()
        print 'after purchase: ', Item.objects.get(id=request.POST["id"]).number_of_times_purchased
        purchased_item = Purchase(item_purchased=item)
        purchased_item.save()
        return redirect(reverse("items"))
