from django.conf.urls import url, include
from django.contrib import admin

from .views import Home, PicsView, ItemView

urlpatterns = [
    url(r'^', Home.as_view()),
    url(r'pics^', PicsView.as_view()),
    url(r'item', ItemView.as_view()),
]
