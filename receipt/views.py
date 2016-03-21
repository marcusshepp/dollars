from django.http import JsonResponse
from django.core.urlresolvers import reverse, reverse_lazy
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
    WhatPageForm,
)
from .models import (
    Item,
    Purchase,
    Action,
    Start,
    Catagory,
    WhatPage,
)


DEFAULT_PER_PAGE = 5

def get_post(request, name):
    """
    Quickly and safely check for a key in POST.
    """
    return request.POST.get(name, None)

def get_get(request, name):
    """
    Quickly and safely check for a key in GET.
    """
    return request.GET.get(name, None)

def page_it(queryset, page_number, number_per_page):
    """
    returns the query for the given page. 
    """
    paginator = Paginator(queryset, number_per_page)
    if page_number:
        if int(page_number) > paginator.num_pages:
            objecs = paginator.page(paginator.num_pages)
        elif type(page_number) == int:
            objecs = paginator.page(page_number)
        else:
            objecs = paginator.page(1)
    else: objecs = paginator.page(1)
    return objecs, paginator

def cata_names(user, a):
    """
    A setted list of catagory names for the given user.
    Can return all catagory names if `a` is set to True.
    """
    cata_names = list()
    all_catagories = Catagory.objects.filter(user_id=user.id).order_by("-id")
    for catagory in all_catagories:
        if a:
            cata_names.append(catagory.name)
        else:
            if catagory.has_a_purchase(user):
                cata_names.append(catagory.name)
    return list(set(cata_names))

def cata_ids(user, a):
    """
    A setted list of catagory ids for the given user.
    Can return all catagory ids if `a` is set to True.
    """
    cata_ids = list()
    all_catagories = Catagory.objects.filter(user_id=user.id).order_by("-id")
    for catagory in all_catagories:
        if a:
            # if all catagories
            cata_ids.append(catagory.id)
        else:
            if catagory.has_a_purchase(user):
                cata_ids.append(catagory.id)
    return list(set(cata_ids))


class Common(View):
    """
    Giving all the views a check to see if the User is logged
    in before executing dispatch.
    """
    @method_decorator(login_required)
    def dispatch(self, request, *a, **kw):
        return super(Common, self).dispatch(request, *a, **kw)


class MainView(Common):
    """
    The only view that doesn't return JSON on its get method.
    """
    template_name = "receipt/main.html"

    def dispatch(self, request, *a, **kw):
        super(MainView, self).dispatch(request, *a, **kw)
        start = Start.objects.all()
        user = request.user
        if request.user.is_anonymous():
            return redirect(reverse_lazy("login"))
        if not start:
            """
            *** INIT ***
            This is where the first get request ever comes in.
            Because this will only execute once the app has started.
            """
            print "*****START*****"
            Start.objects.create(is_start_of_app=False)
            init_page_data = dict()
            init_page_data["obj"]               = "item"
            init_page_data["page_number"]       = 1
            init_page_data["number_per_page"]   = DEFAULT_PER_PAGE
            init_page_data["user"]              = user.id
            item_form                           = WhatPageForm(init_page_data)
            if item_form.is_valid():
                item_form.save()
            item_page = WhatPage.objects.get(obj="item", user_id=user.id)
            assert(item_page.obj == "item"), "no item page"
            init_page_data["obj"] = "purchase"
            purchase_form = WhatPageForm(init_page_data)
            if purchase_form.is_valid():
                purchase_form.save()
            purchase_page = WhatPage.objects.get(obj="purchase", user_id=user.id)
            assert(purchase_page.obj == "purchase"), "no purchase page"
        return self.get(request, *a, **kw)

    def get(self, request, *a, **kw):
        """
        Just load the page.
        """
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


class ItemEndPoint(Common):
    """
    Performs operations on Item model.
    Does `purchase` on post.
    Also handles Pagination for both load ie GET
    and for next, prev, number per page ie POST.
    """
    def get(self, request, *a, **kw):
        data = dict()
        user = request.user
        items_queryset = Item.objects.filter(user=user)
        if not items_queryset:
            data["items"] = False
        else:
            data["items"] = True
            item_page = WhatPage.objects.filter(obj="item", user_id=user.id)
            if item_page:
                item_page            = item_page[0]
                page_number          = item_page.page_number
                number_per_page      = item_page.number_per_page
                items, paginator     = page_it(items_queryset, page_number, number_per_page)
                total_pages          = paginator.num_pages
                if items:
                    data["names"]                   = [ item.__unicode__() for item in items ]
                    data["where_from"]              = [ item.where_from for item in items ]
                    data["prices"]                  = [ item.price for item in items ]
                    data["times_purchased"]         = [ item.number_of_times_purchased for item in items ]
                    data["ids"]                     = [ item.id for item in items ]
                    data["cata_names_set"]          = cata_names(user, 0)
                    data["cata_ids_set"]            = cata_ids(user, 0)
                    data["page_number"]             = page_number
                    data["total_pages"]             = total_pages
                    data["per_page"]                = number_per_page
                else:
                    data["item_length"]        = 0
            else:
                print "****NO ITEM PAGE****"
        return JsonResponse(data)
    
    def purchased_item(self, request):
        item = Item.objects.get(id=request.POST["id"])
        item.increase_number_of_times_purchased()
        purchdata = dict()
        purchdata["item_purchased"] = item
        purchdata["user"] = request.user
        if request.POST.get("amount_payed", None):
            purchdata["amount_payed"] = request.POST.get("amount_payed")
        else: purchdata["amount_payed"] = item.price
        purchased_item = Purchase(**purchdata)
        purchased_item.save()
        
    def post(self, request, *a, **kw):
        """
        Next, Prev, Number Per Page
        """
        data                = dict()
        user                = request.user
        move                = get_post(request, "move")
        prev                = get_post(request, "prev")
        next_               = get_post(request, "next")
        number_per_page     = get_post(request, "number_per_page")
        item_page           = WhatPage.objects.filter(obj="item", user_id=user.id)
        items_queryset      = Item.objects.filter(user=user)
        if get_post(request, "id"):
            self.purchased_item(request)
        else:
            if item_page:
                item_page = item_page[0]
                paginator = Paginator(items_queryset, item_page.number_per_page)
                if number_per_page:
                    item_page.change_number_per_page(number_per_page)
                if move:
                    if prev:
                        item_page.decrement_page_number()
                    elif next_:
                        if item_page.page_number < paginator.num_pages:
                            item_page.increase_page_number()
            item_page = WhatPage.objects.filter(obj="item", user_id=user.id)
            if item_page:
                item_page = item_page[0]
                items, paginator = page_it(Item.objects.filter(user=user), item_page.page_number, item_page.number_per_page)
                data["ids"]             = [i.id for i in items]
                data["names"]           = [i.name for i in items]
                data["companies"]       = [i.where_from for i in items]
                data["prices"]          = [i.price for i in items]
                data["length"]          = len(items)
                data["times_purchased"] = [i.number_of_times_purchased for i in items]
                data["purchased"]       = True
                data["per_page"]        = item_page.number_per_page
        return JsonResponse(data)


class ItemManEndPoint(Common):
    """ Manipulates `Items`. ie DELETE + EDIT """
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
                data["item_id"]             = item[0].id
                data["item_name"]           = item[0].name
                data["item_price"]          = item[0].price
                data["company_name"]        = item[0].where_from
                data["item_catagory_id"]    = item[0].catagory.id
                data["item_catagory_name"]  = item[0].catagory.name
                data["company"]             = item[0].where_from
                catagories                  = Catagory.objects.all()
                if catagories:
                    data["catagory_names"]  = [ catagory.name for catagory in catagories ]
                    data["catagory_ids"]    = [ catagory.id for catagory in catagories ]
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


class ActionEndPoint(Common):
    """
    Works as an Action End Point returning data for the Users
    last actions. Can also perform "Undo's" if nessessary via POST.
    """
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
            latest_action                             = actions.order_by("-id")[0]
            action_data["latest_action_object_name"]  = latest_action.object_name
            action_data["latest_action_title"]        = latest_action.title
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


class CatagoryEndPoint(Common):
    """
    Catagories that are associated with Items and Purchases.
    Works as an end point to recieve catagory information.
    """
    def get(self, request, *a, **kw):
        data = dict()
        if not request.user.is_anonymous():
            data["cata_names_set"] = cata_names(request.user, True)
            data["cata_ids_set"] = cata_ids(request.user, True)
        else:
            data["not_logged_in"] = True
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        data = dict()
        user = request.user
        catas = Catagory.objects.filter(user_id=user.id)
        cata_name = get_post(request, "catagory_name")
        if cata_name:
            if not catas:
                data["first"] = 1
            cata_data = dict()
            cata_data["name"] = cata_name
            cata_data["user"] = user.id
            cata = CatagoryForm(cata_data)
            if cata.is_valid():
                cata.save()
                data["success"] = 1
            else:
                data["failure"] = 1
        return JsonResponse(data)


class PurchaseTableEndPoint(Common):
    """
    Performs operations on Purchase model.
    Handles Pagination for both load ie GET
    and for next, prev, number per page ie POST.
    """
    def get(self, request, *a, **kw):
        """ Accepts a purchase query and returns a json object """
        data = dict()
        user = request.user
        purchases_queryset = Purchase.objects.filter(user=user)
        purchase_page = WhatPage.objects.filter(obj="purchase",
                                                user_id=user.id)
        if purchase_page:
            purchase_page        = purchase_page[0]
            page_number          = purchase_page.page_number
            number_per_page      = purchase_page.number_per_page
            purchases, paginator = page_it( purchases_queryset,
                                            page_number,
                                            number_per_page)
            total_pages          = paginator.num_pages
            if purchases:
                data["purchased_items_names"]   = [i.item_purchased.__unicode__() for i in purchases]
                data["purchased_date_created"]  = [i.date_display() for i in purchases]
                data["amount_payed"]            = [i.amount_payed for i in purchases]
                data["purchased_length"]        = len(purchases)
                data["total"]                   = sum([purchase.amount_payed for purchase in purchases])
                data["cata_names_set"]          = cata_names(user, 0)
                data["cata_ids_set"]            = cata_ids(user, 0)
                data["page_number"]             = page_number
                data["total_pages"]             = total_pages
                data["per_page"]                = number_per_page
            else:
                data["purchased_length"]        = 0
        else:
            print "****NO PURCHASE PAGE****"
        return JsonResponse(data)

    def post(self, request, *a, **kw):
        data                = dict()
        user                = request.user
        catagory_id         = get_post(request, "catagory_id")
        move                = get_post(request, "move")
        prev                = get_post(request, "prev")
        next_               = get_post(request, "next")
        number_per_page     = get_post(request, "number_per_page")
        purchase_page       = WhatPage.objects.filter(obj="purchase", user_id=user.id)
        purchases_queryset  = Purchase.objects.filter(user=user)
        if purchase_page:
            purchase_page = purchase_page[0]
            paginator = Paginator(purchases_queryset, purchase_page.number_per_page)
        if number_per_page:
            purchase_page.change_number_per_page(number_per_page)
        if move:
            if prev:
                purchase_page.decrement_page_number()
            elif next_:
                if purchase_page.page_number < paginator.num_pages:
                    purchase_page.increase_page_number()
        paginator = Paginator(purchases_queryset, purchase_page.number_per_page)
        if catagory_id:
            items = Item.objects.filter(
                catagory__id=catagory_id,
                user=user,
                )
        else:
            items = Item.objects.filter(user=user)
        purchases = list()
        if items:
            for item in items:
                purchases_q = Purchase.objects.filter(item_purchased__name=item.name)
                if purchases_q:
                    for purchase in purchases_q:
                        purchases.append(purchase)
        if purchases:
            data["purchased_items_names"]  = [i.item_purchased.__unicode__() for i in purchases]
            data["purchased_date_created"] = [i.date_display() for i in purchases]
            data["purchased_length"]       = len(purchases)
            data["total"] = 0
            for purchase in purchases:
                data["total"] += purchase.amount_payed
            data["amount_payed"]           = [i.amount_payed for i in purchases]
            data["cata_names_set"]         = cata_names(user, 0)
            data["cata_ids_set"]           = cata_ids(user, 0)
        else: data["no_purchases_for_query"] = True
        return JsonResponse(data)
