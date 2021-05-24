from rest_framework import routers
from categories.views import MainCategoryView, SubCategoryView

router = routers.DefaultRouter()
router.register(r"categories", MainCategoryView, basename="categories")
router.register(r"subcategories", SubCategoryView, basename="subcategories")


urlpatterns = router.urls
