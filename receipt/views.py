from django.http import JsonResponse
from django.core.urlresolvers import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, View
from django.views.decorators.csrf import csrf_exempt

from .forms import (
    PicForm,
    ItemForm,
    ActionForm,
    PurchaseForm)
from .models import (
    Pic,
    Item,
    Purchase,
    Action,
    Catagory)


def get_post(request, name):
    return request.POST.get(name, None)
def get_session(request, name):
    return request.session.get(name, None)
def page_it(request, namespace, queryset, number_per_page, per_determined_page_number=None):
    paginator = Paginator(queryset, number_per_page)
    page = request.GET.get(namespace+"_page", None)
    if page:
        try:
            objecs = paginator.page(page)
        except PageNotAnInteger:
            objecs = paginator.page(1)
        except EmptyPage:
            objecs = paginator.page(paginator.num_pages)
        return objecs
    else: return paginator.page(1)
def get_page_number(queryset, number_per_page, per_determined_page_number):
    paginator = Paginator(queryset, number_per_page)
    return paginator.page(per_determined_page_number)
def increase_page_number_session_var(request, name):
    value = get_session(request, name)
    if value:
        request.session[name] += 1


class MainView(TemplateView):

    template_name = "receipt/main.html"

    def get(self, request, *a, **kw):
        """ Renders the page w `total`, `# of purch`, `catagories` """
        context = dict()
        context["form"] = ItemForm
        items = Item.objects.all()
        if items:
            context["items"] = page_it(request, "items", items, 5)
        purchases = Purchase.objects.all()
        if purchases:
            context["purchased_items"] = page_it(request, "purchased_items", purchases, 5)
            total = 0
            for i in purchases:
                total += i.amount_payed
            context["total"] = total
            context["purchased_length"] = purchases.count()
        catagories = Catagory.objects.all()
        if catagories:
            context["all_catagories"] = catagories
            catagory_names = list()
            for purchase in purchases:
                catagory_names.append(purchase.item_purchased.catagory.name)
            catagory_names = set(catagory_names)
            catagory_context = list()
            for catagory_name in catagory_names:
                catagory = Catagory.objects.get(name=catagory_name)
                catagory_context.append(catagory)
            context["set_catagories"] = catagory_context
        return render(request, self.template_name, context)

    def post(self, request, *a, **kw):
        """
        Add a new Item
        returns whether or not the item form successfully saved.
        """
        context = dict()
        request.POST = request.POST.copy()
        if get_post(request, "catagory_id"):
            request.POST["catagory"] = int(request.POST.pop("catagory_id")[0])
        form = ItemForm(request.POST)
        if form.is_valid():
            form.save()
            context["success"] = True
            if get_post(request, "purchase") == "true":
                item = Item.objects.get(name=request.POST["name"])
                item.increase_number_of_times_purchased()
                data = {"amount_payed": get_post(request, "price"),
                        "item_purchased": item.id}
                form = PurchaseForm(data)
                if form.is_valid():
                    form.save()
                context["purchased"] = True
        else:
            context["invalid_form_data"] = True
        return JsonResponse(context)


class ItemEndPoint(TemplateView):

    template_name = "receipt/main.html"

    def get(self, request, *a, **kw):
        print request.session.items()
        items = Item.objects.all()
        data = dict()
        data["ids"] = [i.id for i in items]
        data["names"] = [i.name for i in items]
        data["companies"] = [i.company_came_from for i in items]
        data["prices"] = [i.price for i in items]
        data["length"] = items.count()
        data["times_purchased"] = [i.number_of_times_purchased for i in items]
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        item = Item.objects.get(id=request.POST["id"])
        item.increase_number_of_times_purchased()
        purchase_data = dict()
        purchase_data["item_purchased"] = item
        if request.POST.get("amount_payed", None):
            purchase_data["amount_payed"] = request.POST.get("amount_payed")
        else: purchase_data["amount_payed"] = item.price
        purchased_item = Purchase(**purchase_data)
        purchased_item.save()
        data = dict()
        data["purchased"] = True
        return JsonResponse(data)


class ItemManEndPoint(View):
    """ Manipulates `Items`. ie DELETE + EDIT """

    def get(self, request, *a, **kw):
        data = dict()
        return JsonResponse(data)

    def edit(id):
        data = dict()
        item = Item.objects.get(id=id)
        return item

    def post(self, request, *a, **kw):
        data = dict()
        idd = get_post(request, "id")
        if idd:
            item = Item.objects.filter(id=int(idd))
            if item:
                data["item_id"] = item[0].id
                data["item_name"] = item[0].name
                data["item_price"] = item[0].price
                data["company_name"] = item[0].company_came_from
                data["item_catagory_id"] = item[0].catagory.id
                data["item_catagory_name"] = item[0].catagory.name
                data["company"] = item[0].company_came_from
                catagories = Catagory.objects.all()
                if catagories:
                    data["catagory_names"] = [
                        catagory.name for catagory in catagories]
                    data["catagory_ids"] = [
                        catagory.id for catagory in catagories]
                    data["catagory_length"] = catagories.count()
            delete_item = get_post(request, "delete_item")
            if delete_item:
                item[0].delete()
            edit = get_post(request, "edit")
            if edit:
                item.update(name=get_post(request, "name"))
                item.update(
                    company_came_from=get_post(request, "company_came_from"))
                item.update(price=get_post(request, "price"))
                item.update(catagory=Catagory.objects.get(
                    id=get_post(request, "catagory_id")))
        else:
            data["no_id"] = True
        return JsonResponse(data)


class ActionEndPoint(View):

    def delete_latest_and_return_name(self, objct):
        """
        Queries the latest object, deletes it and returns it's name.
        """
        name = ""
        objs = objct.objects.all()
        if objs:
            latest_obj = objs.order_by("-id")[0]
            if hasattr(latest_obj, "item_purchased"):
                name += str(latest_obj.item_purchased.name)
            elif latest_obj.name:
                name += str(latest_obj.name)
            latest_obj.delete()
        return name

    def delete_latest_action(self):
        """ Deletes latest action """
        latest_action = Action.latest_action()
        latest_action.delete()

    def get(self, request, *a, **kw):
        """ Returns attrs for latest `action`. """
        action_data = dict()
        actions = Action.objects.all()
        if actions:
            latest_action = actions.order_by("-id")[0]
            action_data["latest_action_object_name"] = latest_action.object_name
            action_data["latest_action_title"] = latest_action.title
            action_data["latest_action_undo_handler"] = latest_action.undo_handler
        else:
            action_data["no_actions"] = True
        return JsonResponse(action_data)

    def post(self, request, *a, **kw):
        """
        Creates `actions` and performs `undo handlers`.
        """
        data = dict()
        request.POST = request.POST.copy()
        if get_post(request, "create_action"):
            form = ActionForm(request.POST)
            if get_post(request, "description"):
                form.description = data["description"]
            if form.is_valid():
                form.save()
        elif get_post(request, "undo"):
            if get_post(request, "undo_handler") == "undo purchase":
                # delete purchase
                latest_purchase_name = self.delete_latest_and_return_name(Purchase)
                if latest_purchase_name:
                    data["item_purchased"] = latest_purchase_name
                    # decrement item.number_of_times_purchased
                    item = Item.objects.filter(name=latest_purchase_name)[0]
                    item.decrement_number_of_times_purchased()
                    data["purchase_deleted"] = True
                    self.delete_latest_action()
            elif get_post(request, "undo_handler") == "undo add item":
                latest_item_name = self.delete_latest_and_return_name(Item)
                if latest_item_name:
                    data["deleted_item_name"] = latest_item_name
                    self.delete_latest_action()
        data["success"] = True
        return JsonResponse(data)


class PurchaseTableEndPoint(View):

    def purchase_json_resp(self, purchases=None):
        """ Accepts a purchase query and returns a json object """
        data = dict()
        if purchases:
            data["purchased_items_names"] = [i.item_purchased.__unicode__() for i in purchases]
            data["purchased_date_created"] = [i.date_display() for i in purchases]
            data["amount_payed"] = [i.amount_payed for i in purchases]
            data["purchased_length"] = purchases.count()
            total = 0
            for purchase in purchases:
                total += purchase.amount_payed
            data["total"] = total
        else:
            data["purchased_length"] = 0
        return JsonResponse(data)

    def filter_by_catagory(self, catagory_name):
        data = dict()
        if catagory_name:
            items = Item.objects.filter(catagory__name=catagory_name)
            purchases = list()
            for item in items:
                purchases_q = Purchase.objects.filter(item_purchased__name=item.name)
                if purchases_q:
                    for purchase in purchases_q:
                        purchases.append(purchase)
            if purchases:
                data["purchased_items_names"] = [i.item_purchased.__unicode__() for i in purchases]
                data["purchased_date_created"] = [i.date_display() for i in purchases]
                data["purchased_length"] = len(purchases)
                total = 0
                for purchase in purchases:
                    total += purchase.amount_payed
                data["total"] = total
                data["amount_payed"] = [i.amount_payed for i in purchases]
        return JsonResponse(data)

    def get(self, request, *a, **kw):
        purchases = Purchase.objects.all()
        return self.purchase_json_resp(purchases)

    def post(self, request, *a, **kw):
        data = dict()
        catagory_name = get_post(request, "catagory_name")
        if catagory_name:
            return self.filter_by_catagory(catagory_name)
        return JsonResponse(data)


class CatagoryEndPoint(View):

    def get(self, request, *a, **kw):
        data = dict()
        catagories = Catagory.objects.all()
        if catagories:
            data["catagory_length"] = catagories.count()
            data["catagory_names"] = [catagory.string() for catagory in catagories]
            data["catagory_ids"] = [catagory.id for catagory in catagories]
            print data.items()
        else:
            data["catagory_length"] = 0
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        data = dict()
        if get_post(request, "catagory_name"):
            cata = Catagory.objects.get_or_create(name=get_post(request, "catagory_name"))
            if cata:
                data["success"] = True
        return JsonResponse(data)
