from django.http import JsonResponse
from django.core.urlresolvers import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, redirect
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.views.generic import View
from django.views.decorators.csrf import csrf_exempt

from .forms import (
    ItemForm,
    ActionForm,
    PurchaseForm,
    CatagoryForm,
)
from .models import (
    Item,
    Purchase,
    Action,
    Start,
    Catagory,
)


def get_post(request, name):
    return request.POST.get(name, None)

def get_get(request, name):
    return request.GET.get(name, None)

def get_session(request, name):
    return request.session.get(name, None)

def get_page_number(queryset, number_per_page, per_determined_page_number):
    paginator = Paginator(queryset, number_per_page)
    return paginator.page(per_determined_page_number)

def increase_page_number_session_var(request, name):
    value = get_session(request, name)
    if value:
        request.session[name] += 1


class MainView(View):

    template_name = "receipt/main.html"

    @method_decorator(login_required)
    def dispatch(self, request, *a, **kw):
        start = Start.objects.all()
        if not start:
            """
            *** INIT ***
            This is where the first get request ever comes in.
            Because this will only execute once the app has started.
            """
            Start.objects.create(is_start_of_app=False)
            request.session["purchases_page_number"] = 0
            request.session["items_page_number"] = 0
            request.session["purchases_number_per_page"] = 0
            request.session["items_number_per_page"] = 0
        return super(MainView, self).dispatch(request, *a, **kw)

    def get(self, request, *a, **kw):
        return render(request, self.template_name)

    def post(self, request, *a, **kw):
        """
        Add a new Item
        returns whether or not the item form successfully saved.
        """
        context = dict()
        request.POST = request.POST.copy()
        if get_post(request, "catagory_id"):
            request.POST["catagory"] = int(request.POST.pop("catagory_id")[0])
        request.POST["user"] = request.user.id
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


class ItemEndPoint(View):

    def get(self, request, *a, **kw):
        items = Item.objects.filter(user=request.user)
        data = dict()
        data["ids"] = [i.id for i in items]
        data["names"] = [i.name for i in items]
        data["companies"] = [i.where_from for i in items]
        data["prices"] = [i.price for i in items]
        data["length"] = items.count()
        data["times_purchased"] = [i.number_of_times_purchased for i in items]
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        item = Item.objects.get(id=request.POST["id"])
        item.increase_number_of_times_purchased()
        purchase_data = dict()
        purchase_data["item_purchased"] = item
        purchase_data["user"] = request.user
        if request.POST.get("amount_payed", None):
            purchase_data["amount_payed"] = request.POST.get("amount_payed")
        else: purchase_data["amount_payed"] = item.price
        purchased_item = Purchase(**purchase_data)
        purchased_item.save()
        data = dict()
        data["item_name"] = item.name
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
                data["company_name"] = item[0].where_from
                data["item_catagory_id"] = item[0].catagory.id
                data["item_catagory_name"] = item[0].catagory.name
                data["company"] = item[0].where_from
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
                    where_from=get_post(request, "where_from"))
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
            request.POST["user"] = request.user.id
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


def cata_names(user, a):
    cata_names = list()
    all_catagories = Catagory.objects.filter(user_id=user.id).order_by("-id")
    for catagory in all_catagories:
        if a:
            cata_names.append(catagory.name)
        else:
            if catagory.has_a_purchase(user):
                cata_names.append(catagory.name)
    return cata_names

def cata_ids(user, a):
    cata_ids = list()
    for catagory in Catagory.objects.filter(user_id=user.id):
        if a:
            cata_ids.append(catagory.id)
        else:
            if catagory.has_a_purchase(user):
                cata_ids.append(catagory.id)
    return cata_ids


class CatagoryEndPoint(View):

    def get(self, request, *a, **kw):
        data = dict()
        data["cata_names_set"] = cata_names(request.user, True)
        data["cata_ids_set"] = cata_ids(request.user, True)
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        data = dict()
        user = request.user
        catas = Catagory.objects.filter(user_id=user.id)
        cata_name = get_post(request, "catagory_name")
        if cata_name:
            if not catas:
                data["first"] = True
            cata_data = dict()
            cata_data["name"] = cata_name
            cata_data["user"] = user.id
            cata = CatagoryForm(cata_data)
            if cata.is_valid():
                cata.save()
                data["success"] = True
        return JsonResponse(data)


class PurchaseTableEndPoint(View):

    def get(self, request, *a, **kw):
        """ Accepts a purchase query and returns a json object """
        data = dict()
        user = request.user
        if not request.user.is_anonymous():
            purchases = Purchase.objects.filter(user=request.user)
            if purchases:
                data["purchased_items_names"] = [i.item_purchased.__unicode__() for i in purchases]
                data["purchased_date_created"] = [i.date_display() for i in purchases]
                data["amount_payed"] = [i.amount_payed for i in purchases]
                data["purchased_length"] = purchases.count()
                data["total"] = sum([purchase.amount_payed for purchase in purchases])
                data["cata_names_set"] = list(set(cata_names(user, 0)))
                data["cata_ids_set"] = list(set(cata_ids(user, 0)))
            else:
                data["purchased_length"] = 0
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        data = dict()
        user = request.user
        catagory_id = get_post(request, "catagory_id")
        if catagory_id:
            items = Item.objects.filter(
                catagory__id=catagory_id,
                user=user,
                )
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
                data["cata_names_set"] = list(set(cata_names(user, 0)))
                data["cata_ids_set"] = list(set(cata_ids(user, 0)))
            else: data["no_purchases_for_query"] = True
        return JsonResponse(data)
