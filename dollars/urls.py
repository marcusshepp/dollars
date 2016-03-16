from django.conf.urls import url, include
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings

from receipt.views import (
    MainView,
    ItemEndPoint,
    ItemManEndPoint,
    ActionEndPoint,
    PurchaseTableEndPoint,
    CatagoryEndPoint,
    )
from accounts.views import (
    Registeration,
    Login,
)

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    # receipt
    url(r'^dollars/$', MainView.as_view(), name="items"),
    url(r'^api/items/$', ItemEndPoint.as_view(), name="api_items"),
    url(r'^api/items_edit/$', ItemManEndPoint.as_view(), name="api_items_edit"),
    url(r'^api/actions/$', ActionEndPoint.as_view(), name="api_actions"),
    url(r'^api/purchases/$', PurchaseTableEndPoint.as_view(), name="api_purchases"),
    url(r'^api/catagories/$', CatagoryEndPoint.as_view(), name="api_catagories"),
    # accounts
    url(r'^register/$', Registeration.as_view(), name="register"),
    url(r'^login/$', Login.as_view(), name="login"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)