import datetime
import typing
from collections import defaultdict

from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import QuerySet, DateTimeField, Sum
from django.db.models.functions import Trunc
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from transactions.serializers import TransactionDetailsSerializer
from yaba.common_utils import get_this_month_date_range, get_prev_month_date_range


@api_view()
def get_monthly_expense_stats(request: Request) -> HttpResponse:
    base_query = request.user.transactions.all()
    this_month_expense, this_month_income = get_transaction_summary_by_date_range(
        base_query, *get_this_month_date_range()
    )
    prev_month_expense, prev_month_income = get_transaction_summary_by_date_range(
        base_query, *get_prev_month_date_range()
    )
    return Response(
        {
            "thisMonth": {"income": this_month_income, "expense": this_month_expense},
            "prevMonth": {
                "income": prev_month_income,
                "expense": prev_month_expense,
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view()
def get_most_recent_transactions(request: Request) -> Response:
    count = request.GET.get("count", "10")
    count = int(count) if count.isdecimal() else 10
    transactions = request.user.transactions.all()[:count]
    serializer = TransactionDetailsSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view()
def get_monthly_expense_stats_by_category(request: Request) -> Response:
    base_query = request.user.transactions.all()
    this_month_by_category = get_expenses_by_category(base_query, request.user, *get_this_month_date_range())
    prev_month_by_category = get_expenses_by_category(base_query, request.user, *get_prev_month_date_range())
    return Response(
        {"thisMonth": this_month_by_category, "prevMonth": prev_month_by_category}, status=status.HTTP_200_OK
    )


@api_view()
def get_monthly_expense_stats_by_subcategory(request: Request, category_pk: int) -> Response:
    base_query = request.user.transactions.all()
    this_month_by_subcategory = get_expenses_by_subcategory(
        base_query, request.user, category_pk, *get_this_month_date_range()
    )
    prev_month_by_subcategory = get_expenses_by_subcategory(
        base_query, request.user, category_pk, *get_prev_month_date_range()
    )
    return Response(
        {"thisMonth": this_month_by_subcategory, "prevMonth": prev_month_by_subcategory}, status=status.HTTP_200_OK
    )


def get_start_date(end_date: datetime.datetime, timeline: str) -> typing.Optional[datetime.datetime]:
    if timeline not in ["week", "month", "year"]:
        return None
    if timeline == "year":
        return (end_date - datetime.timedelta(days=364)).replace(hour=0, minute=0, second=0, microsecond=0)
    if timeline == "month":
        return (end_date - datetime.timedelta(days=30)).replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        return (end_date - datetime.timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)


def generate_transaction_history_base_queryset(
    start_date: datetime.datetime, end_date: datetime.datetime, account_pk: int, request: Request
) -> QuerySet:
    return request.user.transactions.filter(account__id=account_pk).filter(created__range=(start_date, end_date))


def get_timeline_param(request: Request) -> str:
    return request.GET.get("timedelta", "month")


def get_transaction_summary_by_date_range(
    base_query: QuerySet, from_date: datetime.datetime, to_date: datetime.datetime
) -> (int, int):
    date_filtered_query = base_query.filter(created__range=(from_date, to_date))
    sum_expense = date_filtered_query.filter(amount__lt=0).aggregate(Sum("amount"))
    sum_income = date_filtered_query.filter(amount__gt=0).aggregate(Sum("amount"))
    return (
        sum_expense["amount__sum"] if sum_expense["amount__sum"] else 0,
        sum_income["amount__sum"] if sum_income["amount__sum"] else 0,
    )


def get_expenses_by_category(
    base_query: QuerySet, user: User, from_date: datetime.datetime, to_date: datetime.datetime
) -> typing.List[typing.Dict]:
    sum_dict = defaultdict(lambda: 0)
    for category in user.main_categories.filter(isIncome=False):
        sum_dict[(category.name, category.id)] = 0

    transactions = (
        base_query.filter(created__range=(from_date, to_date), amount__lt=0)
        .select_related("subcategory__main_category")
        .values("amount", "subcategory__main_category__name", "subcategory__main_category__id")
    )

    for transaction in transactions:
        sum_dict[
            (transaction["subcategory__main_category__name"], transaction["subcategory__main_category__id"])
        ] -= transaction["amount"]

    return [{"name": item[0][0], "value": item[1], "extra": {"id": item[0][1]}} for item in sum_dict.items()]


def get_expenses_by_subcategory(
    base_query: QuerySet, user: User, category_pk: int, from_date: datetime.datetime, to_date: datetime.datetime
) -> typing.List[typing.Dict]:
    sum_dict = defaultdict(lambda: 0)
    for subcategory in user.subcategories.filter(main_category__id=category_pk):
        sum_dict[(subcategory.name, subcategory.id)] = 0

    transactions = (
        base_query.filter(created__range=(from_date, to_date), amount__lt=0, subcategory__main_category__id=category_pk)
        .select_related("subcategory")
        .values("amount", "subcategory__name", "subcategory__id")
    )

    for transaction in transactions:
        sum_dict[(transaction["subcategory__name"], transaction["subcategory__id"])] -= transaction["amount"]

    return [{"name": item[0][0], "value": item[1], "extra": {"id": item[0][1]}} for item in sum_dict.items()]
