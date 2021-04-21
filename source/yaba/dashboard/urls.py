from django.urls import path

from dashboard.views import *

urlpatterns = [
    path('dashboard/<int:account_pk>/', get_single_account_history)
]
