# rom django.contrib import admin
from django.urls import path, include

urlpatterns = []

urlpatterns += [
    # No need for admin site functionality in normal deployment.
    # Left it here since it could be useful in debugging in the future.
    # path("admin/", admin.site.urls),
]

urlpatterns += [
    path("", include("categories.urls")),
    path("", include("accounts.urls")),
    path("", include("transactions.urls")),
    path("", include("dashboard.urls")),
]

urlpatterns += [
    path("authentication/", include("dj_rest_auth.urls")),
    path("registration/", include("dj_rest_auth.registration.urls")),
]
