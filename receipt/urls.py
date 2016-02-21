from django.conf.urls import url, include
from django.contrib import admin

from .views import (
    Home,
    PicsView,
    ItemView,
    ItemEndPoint,
    ActionEndPoint,
    Actions)

urlpatterns = [
    url(r'^$', Home.as_view(), name="home"),
    url(r'^pics/$', PicsView.as_view(), name="pics"),
    url(r'^item/$', ItemView.as_view(), name="items"),
    url(r'^actions/$', Actions.as_view(), name="actions"),
    url(r'^api/items/$', ItemEndPoint.as_view(), name="api_items"),
    url(r'^api/actions/$', ActionEndPoint.as_view(), name="api_actions"),
]
