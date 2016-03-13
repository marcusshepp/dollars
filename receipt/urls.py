from django.conf.urls import url, include
from django.contrib import admin

from .views import (
    MainView,
    ItemEndPoint,
    ItemManEndPoint,
    ActionEndPoint,
    PurchaseTableEndPoint,
    CatagoryEndPoint)

urlpatterns = [
    url(r'^$', MainView.as_view(), name="items"),
    url(r'^api/items/$', ItemEndPoint.as_view(), name="api_items"),
    url(r'^api/items_edit/$', ItemManEndPoint.as_view(), name="api_items_edit"),
    url(r'^api/actions/$', ActionEndPoint.as_view(), name="api_actions"),
    url(r'^api/purchases/$', PurchaseTableEndPoint.as_view(), name="api_purchases"),
    url(r'^api/catagories/$', CatagoryEndPoint.as_view(), name="api_catagories"),
]
