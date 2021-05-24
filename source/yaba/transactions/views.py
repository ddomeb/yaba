import typing
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


class TransactionView(viewsets.ViewSet):
    PAGE_LENGTH = 15

    @classmethod
    def list(cls, request: Request) -> Response:
        base_queryset = TransactionView._get_transaction_query_set_from_request(request)

        if (page_number := request.GET.get("page")) and page_number.isdecimal():
            nr_of_transactions = base_queryset.count()
            sliced_queryset = TransactionView._slice_base_query(base_queryset, int(page_number))
            serializer = TransactionDetailsSerializer(sliced_queryset, many=True)
            return Response(
                {
                    "results": serializer.data,
                    "count": nr_of_transactions,
                    "pages": ceil(nr_of_transactions / TransactionView.PAGE_LENGTH),
                },
                status=status.HTTP_200_OK,
            )

        serializer = TransactionDetailsSerializer(base_queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # TODO: check if income category amount is positive
    @classmethod
    def create(cls, request: Request) -> Response:
        data = JSONParser().parse(request)
        if "subcategory" in data.keys() and not subcategory_owned_by_requester(data["subcategory"], request):
            return Response(
                data={"subcategory": [f"Invalid pk \"{data['subcategory']}\" - object does not exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "account" in data.keys() and not account_owned_by_requester(data["account"], request):
            return Response(
                data={"account": [f"Invalid pk \"{data['account']}\" - object does not exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = TransactionSerializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            TransactionView._process_transaction(serializer.validated_data, request.user)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # TODO: don't really need this.
    @classmethod
    def retrieve(cls, request: Request, pk=None) -> Response:
        queryset = request.user.transactions.all()
        transaction = get_object_or_404(queryset, pk=pk)
        serializer = TransactionDetailsSerializer(transaction)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    @classmethod
    def destroy(cls, request: Request, pk=None) -> Response:
        queryset = request.user.transactions.all()
        transaction = get_object_or_404(queryset, pk=pk)
        TransactionView._revert_transaction(transaction.amount, transaction.account)
        transaction.delete()
        return Response(data={}, status=status.HTTP_200_OK)

    @classmethod
    def _process_transaction(cls, transaction: typing.Dict, user: User) -> None:
        account: Account = user.accounts.get(pk=transaction["account"].id)
        account.balance += transaction["amount"]
        account.save()

    @classmethod
    def _revert_transaction(cls, amount: int, account: Account) -> None:
        account: Account = Account.objects.get(pk=account.pk)
        account.balance -= amount
        account.save()

    @classmethod
    def _slice_base_query(cls, base_query: QuerySet, page_number: int) -> QuerySet:
        begin, end = (page_number - 1) * TransactionView.PAGE_LENGTH, page_number * TransactionView.PAGE_LENGTH
        return base_query[begin:end]

    @classmethod
    def _get_transaction_query_set_from_request(cls, request: Request) -> QuerySet:
        base_query = request.user.transactions.all()
        if date_from := request.GET.get("datefrom"):
            as_date = (
                isoparse(date_from)
                .astimezone(pytz.timezone("Europe/Budapest"))
                .replace(hour=0, minute=0, second=0, microsecond=0)
            )
            base_query = base_query.filter(created__gte=as_date)

        if date_to := request.GET.get("dateto"):
            as_date = isoparse(date_to).astimezone(pytz.timezone("Europe/Budapest"))
            as_date = as_date.replace(hour=23, minute=59, second=59, microsecond=999)
            base_query = base_query.filter(created__lte=as_date)

        if (account_pk := request.GET.get("account")) and request.GET.get("account").isdecimal():
            base_query = base_query.filter(account__id=account_pk)

        if (maincategory_pk := request.GET.get("category")) and request.GET.get("category").isdecimal():
            base_query = base_query.filter(subcategory__main_category__id=maincategory_pk)

        if (subcategory_pk := request.GET.get("subcategory")) and request.GET.get("subcategory").isdecimal():
            base_query = base_query.filter(subcategory__id=subcategory_pk)

        if direction := request.GET.get("direction"):
            if direction.lower() == "in":
                base_query = base_query.filter(amount__gt=0)
            elif direction.lower() == "out":
                base_query = base_query.filter(amount__lt=0)

        return base_query
