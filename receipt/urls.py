from django.conf.urls import url, include
from django.contrib import admin

from .views import (
    Home,
    PicsView,
    ItemView,
    ItemEndPoint)

urlpatterns = [
    url(r'^$', Home.as_view(), name="home"),
    url(r'^pics/$', PicsView.as_view(), name="pics"),
    url(r'^item/$', ItemView.as_view(), name="items"),
    url(r'^api/items/$', ItemEndPoint.as_view(), name="api_items"),
]
