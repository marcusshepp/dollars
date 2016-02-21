from django.db.models import F
from django.http import JsonResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, View
from django.views.decorators.csrf import csrf_exempt

from .forms import (
    PicForm,
    ItemForm,
    ActionForm)
from .models import (
    Pic,
    Item,
    Purchase,
    Action)


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


class Actions(TemplateView):

    template_name = "receipt/actions.html"

    def get(self, request, *a, **kw):
        context = dict()
        context["actions"] = Action.objects.all()
        return render(request, self.template_name)

class ItemView(TemplateView):

    template_name = "receipt/item.html"

    def get(self, request, *a, **kw):
        super(ItemView, self).get(request, *a, **kw)
        context = dict()
        context["form"] = ItemForm
        context["items"] = Item.objects.all()
        context["purchased_items"] = Purchase.objects.all()
        total = 0
        for i in context["purchased_items"]:
            total += i.item_purchased.price
        context["total"] = total
        return render(request, self.template_name, context)

    def post(self, request, *a, **kw):
        context = dict()
        form = ItemForm(request.POST)
        if form.is_valid():
            form.save()
            if request.POST["purchase"] == u"true":
                item = Item.objects.get(name=request.POST["name"])
                Purchase.objects.create(item_purchased=item)
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
        if purchased:
            data["purchased_items_names"] = [i.item_purchased.__unicode__() for i in purchased]
            data["purchased_date_created"] = [i.date_display() for i in purchased]
            data["purchased_length"] = purchased.count()
        # total
        total = 0
        for i in purchased:
            total += i.item_purchased.price
        data["total"] = total
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        if request.POST.get(u"undo", None) == u"true":
            Purchase.objects.get(id=request.POST['id'])
        item = Item.objects.get(id=request.POST["id"])
        item.number_of_times_purchased = F("number_of_times_purchased") + 1
        item.save()
        purchased_item = Purchase(item_purchased=item)
        purchased_item.save()
        data = dict()
        data["purchased"] = True
        return JsonResponse(data)


class ActionEndPoint(View):

    def actions(self):
        action = Action.objects.all()
        if action:
            latest_action = action.order_by("-id")[0]
            return {
                "latest_action_object_name": latest_action.object_name,}

    def create_action(self, data):

            return True

    def get(self, request, *a, **kw):
        action_data = dict()
        action_data["latest_action_object_name"] = self.actions().get(
            "latest_action_object_name", None)
        return JsonResponse(action_data)

    def post(self, request, *a, **kw):
        print request.POST
        if request.POST.get("title", None):
            form = ActionForm(request.POST)
            print "form.is_valid(): ", form.is_valid()
            if request.POST.get("description", None):
                print "description"
                form.description = data["description"]
            if form.is_valid():
                print "VALID POST AND CREATE"
                form.save()
        action_post_data = dict()
        action_post_data["success"] = True
        return JsonResponse(action_post_data)
