from rest_framework import routers
from transactions.views import TransactionView

router = routers.DefaultRouter()
router.register(r'transactions', TransactionView, basename="transactions")

urlpatterns = router.urls
