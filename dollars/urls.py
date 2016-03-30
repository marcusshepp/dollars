from django.conf.urls import url, include
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.auth.views import logout_then_login


from receipt.views import (
    MainView,
    ItemEndPoint,
    ItemManEndPoint,
    ActionEndPoint,
    PurchaseTableEndPoint,
    CatagoryEndPoint,
    FilterItemsEndpoint,
    FilterPurchasesEndpoint,
    foo,
)
from accounts.views import (
    Registeration,
    Login,
)

urlpatterns = [
    url(r'^foo/bar$', foo),

    url(r'^foo/', admin.site.urls),
    # accounts
    url(r'^dollars/register/$', Registeration.as_view(), name="register"),
    url(r'^dollars/login/$', Login.as_view(), name="login"),
    url(r'^dollars/logout/', logout_then_login, name="logout"),
    # receipt
    url(r'^dollars/$', MainView.as_view(), name="main"),
    url(r'^dollars/api/items/$', ItemEndPoint.as_view(), name="api_items"),
    url(r'^dollars/api/items_edit/$', ItemManEndPoint.as_view(), name="api_items_edit"),
    url(r'^dollars/api/actions/$', ActionEndPoint.as_view(), name="api_actions"),
    url(r'^dollars/api/purchases/$', PurchaseTableEndPoint.as_view(), name="api_purchases"),
    url(r'^dollars/api/catagories/$', CatagoryEndPoint.as_view(), name="api_catagories"),
    url(r'^dollars/api/filter/items$', FilterItemsEndpoint.as_view(), name="foobarpop"),
    url(r'^dollars/api/filter/purchases$', FilterPurchasesEndpoint.as_view(), name="foobarpopup"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
