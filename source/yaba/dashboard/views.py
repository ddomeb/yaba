import datetime
import typing

from django.db.models import QuerySet, DateTimeField, Sum
from django.db.models.functions import Trunc
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from accounts.models import Account
from dashboard.models import AccountHistory, SeriesData
from dashboard.serializers import AccountHistorySerializer
from yaba.common_utils import account_owned_by_requester


def get_start_date(end_date: datetime.datetime, timeline: str) -> typing.Optional[datetime.datetime]:
    if timeline not in ['week', 'month', 'year']:
        return None
    if timeline == 'year':
        return (end_date - datetime.timedelta(days=364)) \
            .replace(hour=0, minute=0, second=0, microsecond=0)
    if timeline == 'month':
        return (end_date - datetime.timedelta(days=30)) \
            .replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        return (end_date - datetime.timedelta(days=7)) \
            .replace(hour=0, minute=0, second=0, microsecond=0)


def group_transactions_by_timeline(base_query: QuerySet, timeline: str) -> QuerySet:
    trunc_keyword = 'month'
    if timeline == 'week':
        trunc_keyword = 'hour'
    elif timeline == 'month':
        trunc_keyword = 'day'
    elif timeline == 'year':
        trunc_keyword = 'week'
    return base_query \
        .annotate(name=Trunc('created', 'hour', output_field=DateTimeField())) \
        .order_by('-name') \
        .values('name') \
        .annotate(value=Sum('amount'))


def generate_transaction_history_base_queryset(
        start_date: datetime.datetime,
        end_date: datetime.datetime,
        account_pk: int,
        request: Request
) -> QuerySet:
    return request.user.transactions \
        .filter(account__id=account_pk) \
        .filter(created__range=(start_date, end_date))


def generate_account_balance_history(account_pk: int, request: Request) -> AccountHistory:
    timeline = get_timeline_param(request)
    end_date = datetime.datetime.today()
    start_date = get_start_date(end_date, timeline)
    transaction_history = generate_transaction_history_base_queryset(start_date, end_date, account_pk, request)
    grouped_queryset = group_transactions_by_timeline(transaction_history, timeline)

    account: Account = Account.objects.get(pk=account_pk)
    history = AccountHistory(account.name, [])
    current_balance = account.balance
    history.series.append(SeriesData(name=datetime.datetime.today(), value=current_balance))
    for entry in grouped_queryset:
        print(f"entry: {entry['name']} - {entry['value']}")
        current_balance -= entry['value']
        print("current_balance: ", current_balance)
        history.series.append(SeriesData(current_balance, entry['name']))
    # TODO: insert first element at start date
    history.series.append(SeriesData(current_balance, start_date))
    history.series = history.series[::-1]
    return history


def get_timeline_param(request: Request) -> str:
    timeline = request.GET.get('timedelta', 'month')
    # TODO: add 'all' kw
    return 'month' if timeline not in ['week', 'month', 'year', ] else timeline


@api_view()
def get_single_account_history(request: Request, account_pk: int):
    if not account_owned_by_requester(account_pk, request):
        return Response(
            {'account': f'Invalid pk \'{account_pk}\' - object does not exists.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # transaction_history = generate_transaction_history_queryset(timeline, account_pk, request)
    account_balance_history = generate_account_balance_history(account_pk, request)
    serializer = AccountHistorySerializer(account_balance_history)
    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )
