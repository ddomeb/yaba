from django.urls import path

from dashboard.views import (
    get_monthly_expense_stats,
    get_most_recent_transactions,
    get_monthly_expense_stats_by_subcategory,
    get_monthly_expense_stats_by_category,
)

urlpatterns = [
    path("dashboard/monthly_stats/", get_monthly_expense_stats),
    path("dashboard/transaction_history/", get_most_recent_transactions),
    path("dashboard/expense_stats/<int:category_pk>/", get_monthly_expense_stats_by_subcategory),
    path("dashboard/expense_stats/", get_monthly_expense_stats_by_category),
]
