from rest_framework import routers
from .views import AccountView

router = routers.DefaultRouter()
router.register(r"accounts", AccountView, basename="accounts")

urlpatterns = router.urls
