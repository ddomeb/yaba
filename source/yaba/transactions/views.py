from math import ceil

import pytz
from dateutil.parser import isoparse
from django.contrib.auth.models import User
from django.db.models.query import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.parsers import JSONParser
from rest_framework.request import Request
from rest_framework.response import Response

from yaba.common_utils import subcategory_owned_by_requester, account_owned_by_requester
from accounts.models import Account
from transactions.serializers import TransactionDetailsSerializer, TransactionSerializer

PAGE_LENGTH = 15


def process_transaction(transaction: dict, user: User):
    account: Account = user.accounts.get(pk=transaction["account"].id)
    account.balance += transaction["amount"]
    account.save()


def revert_transaction(amount: int, account: Account):
    account: Account = Account.objects.get(pk=account.pk)
    account.balance -= amount
    account.save()


def slice_base_query(base_query: QuerySet, page_number: int) -> QuerySet:
    begin, end = (page_number-1)*PAGE_LENGTH, page_number*PAGE_LENGTH
    return base_query[begin:end]


def get_transaction_query_set_from_request(request: Request) -> QuerySet:
    base_query = request.user.transactions.all()
    if date_from := request.GET.get("datefrom"):
        as_date = isoparse(date_from).astimezone(pytz.timezone('Europe/Budapest'))
        as_date = as_date.replace(hour=0, minute=0, second=0, microsecond=0)
        base_query = base_query.filter(created__gte=as_date)

    if date_to := request.GET.get("dateto"):
        as_date = isoparse(date_to).astimezone(pytz.timezone('Europe/Budapest'))
        as_date = as_date.replace(hour=23, minute=59, second=59, microsecond=999)
        base_query = base_query.filter(created__lte=as_date)

    if (account_pk := request.GET.get("account")) \
            and request.GET.get("account").isdecimal():
        base_query = base_query.filter(account__id=account_pk)

    if (maincategory_pk := request.GET.get("category")) \
            and request.GET.get("category").isdecimal():
        base_query = base_query.filter(subcategory__main_category__id=maincategory_pk)

    if (subcategory_pk := request.GET.get("subcategory")) \
            and request.GET.get("subcategory").isdecimal():
        base_query = base_query.filter(subcategory__id=subcategory_pk)

    if direction := request.GET.get("direction"):
        if direction.lower() == 'in':
            base_query = base_query.filter(amount__gt=0)
        elif direction.lower() == 'out':
            base_query = base_query.filter(amount__lt=0)

    return base_query


# TODO: use JsonResponse instead of Response
class TransactionView(viewsets.ViewSet):

    @classmethod
    def list(cls, request: Request) -> Response:
        base_queryset = get_transaction_query_set_from_request(request)

        if (page_number := request.GET.get("page")) \
                and page_number.isdecimal():
            nr_of_transactions = base_queryset.count()
            sliced_queryset = slice_base_query(base_queryset, int(page_number))
            serializer = TransactionDetailsSerializer(sliced_queryset, many=True)
            return Response(
                {
                    'results': serializer.data,
                    'count': nr_of_transactions,
                    'pages': ceil(nr_of_transactions / PAGE_LENGTH)
                },
                status=status.HTTP_200_OK
            )

        serializer = TransactionDetailsSerializer(base_queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @classmethod
    def create(cls, request: Request) -> Response:
        data = JSONParser().parse(request)
        if 'subcategory' in data.keys() \
                and not subcategory_owned_by_requester(data['subcategory'], request):
            return Response(
                data={"subcategory": [
                    f"Invalid pk \"{data['subcategory']}\" - object does not exists."
                ]},
                status=status.HTTP_400_BAD_REQUEST
            )

        if 'account' in data.keys() \
                and not account_owned_by_requester(data['account'], request):
            return Response(
                data={"account": [
                    f"Invalid pk \"{data['account']}\" - object does not exists."
                ]},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TransactionSerializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            process_transaction(serializer.validated_data, request.user)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @classmethod
    def retrieve(cls, request: Request, pk=None) -> Response:
        queryset = request.user.subcategories.all()
        subcategory = get_object_or_404(queryset, pk=pk)
        serializer = TransactionDetailsSerializer(subcategory)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    @classmethod
    def destroy(cls, request: Request, pk=None) -> Response:
        queryset = request.user.transactions.all()
        transaction = get_object_or_404(queryset, pk=pk)
        transaction.delete()
        revert_transaction(transaction.amount, transaction.account)
        return Response(data=dict(), status=status.HTTP_200_OK)
