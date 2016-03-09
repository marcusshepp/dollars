from django.conf.urls import url, include
from django.contrib import admin

from .views import (
    PicsView,
    ItemView,
    ItemEndPoint,
    ItemManEndPoint,
    ActionEndPoint,
    Actions,
    PurchaseTableEndPoint,
    CatagoryEndPoint)

urlpatterns = [
    url(r'^$', ItemView.as_view(), name="items"),
    url(r'^pics/$', PicsView.as_view(), name="pics"),
    url(r'^actions/$', Actions.as_view(), name="actions"),
    url(r'^api/items/$', ItemEndPoint.as_view(), name="api_items"),
    url(r'^api/items_edit/$', ItemManEndPoint.as_view(), name="api_items_edit"),
    url(r'^api/actions/$', ActionEndPoint.as_view(), name="api_actions"),
    url(r'^api/purchases/$', PurchaseTableEndPoint.as_view(), name="api_purchases"),
    url(r'^api/catagories/$', CatagoryEndPoint.as_view(), name="api_catagories"),
]
