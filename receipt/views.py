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
        items = Item.objects.all()
        if items:
            context["items"] = items
        purchases = Purchase.objects.all()
        if purchases:    
            context["purchased_items"] = purchases
            total = 0
            for i in purchases:
                total += i.item_purchased.price
            context["total"] = total
            context["purchased_length"] = purchases.count()
        return render(request, self.template_name, context)

    def post(self, request, *a, **kw):
        context = dict()
        form = ItemForm(request.POST)
        if form.is_valid():
            form.save()
            context["success"] = True
            if request.POST["purchase"] == "true":
                item = Item.objects.get(name=request.POST["name"])
                Purchase.objects.create(item_purchased=item)
                context["purchased"] = True
        else:
            context["invalid_form_data"] = True
        return JsonResponse(context)

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
        else:
            data["purchased_length"] = 0
        # total
        total = 0
        for i in purchased:
            total += i.item_purchased.price
        data["total"] = total
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        item = Item.objects.get(id=request.POST["id"])
        item.number_of_times_purchased = F("number_of_times_purchased") + 1
        item.save()
        purchased_item = Purchase(item_purchased=item)
        purchased_item.save()
        data = dict()
        data["purchased"] = True
        return JsonResponse(data)


class ActionEndPoint(View):

    def delete_latest_action(self):
        actions = Action.objects.all()
        if actions:
            latest_action = actions.order_by("-id")[0]
            latest_action.delete()

    def get(self, request, *a, **kw):
        action_data = dict()
        actions = Action.objects.all()
        if actions:
            latest_action = actions.order_by("-id")[0]
            action_data["latest_action_object_name"] = latest_action.object_name
            action_data["latest_action_title"] = latest_action.title
            action_data["latest_action_undo_handler"] = latest_action.undo_handler
        else:
            print "No actions available"
            action_data["no_actions"] = True
        return JsonResponse(action_data)
            
    def post(self, request, *a, **kw):
        request.POST = request.POST.copy()
        if request.POST.get("create_action", None):
            form = ActionForm(request.POST)
            if request.POST.get("description", None):
                form.description = data["description"]
            if form.is_valid():
                form.save()
        elif request.POST.get("undo", None):
            if request.POST.get("undo_handler", None) == "undo purchase":
                purchases = Purchase.objects.all()
                if purchases:
                    # delete purchase
                    latest_purchase = purchases.order_by("-id")[0]
                    latest_purchase_name = ""
                    latest_purchase_name += str(latest_purchase.item_purchased.name)
                    latest_purchase.delete()
                    # decrement item.number_of_times_purchased
                    item = Item.objects.filter(name=latest_purchase_name)[0]
                    item.number_of_times_purchased = F("number_of_times_purchased") - 1
                    item.save()
                    data = dict()
                    data["purchase_deleted"] = True
                    data["item_purchased"] = latest_purchase_name
                    self.delete_latest_action()
                    return JsonResponse(data)
            elif request.POST.get("undo_handler", None) == "undo add item":
                items = Item.objects.all()
                if items:
                    latest_item = items.order_by("-id")[0]
                    latest_item_name = ""
                    latest_item_name += str(latest_item.name)
                    self.delete_latest_action()
                    latest_item.delete()
                    data = dict()
                    data["deleted_item_name"] = latest_item_name
                    return JsonResponse(data)
        action_post_data = dict()
        action_post_data["success"] = True
        return JsonResponse(action_post_data)
