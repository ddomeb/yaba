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


def process_transaction(transaction: dict, user: User):
    account: Account = user.accounts.get(pk=transaction["account"]["id"])
    account.balance += transaction["amount"]
    account.save()


def revert_transaction(amount: int, account: Account):
    account: Account = Account.objects.get(pk=account.pk)
    account.balance -= amount
    account.save()


def get_transaction_query_set_from_request(request: Request) -> QuerySet:
    base_query = request.user.transactions.all()
    if date_from := request.GET.get("datefrom"):
        base_query = base_query.filter(created__gte=date_from)

    if date_to := request.GET.get("dateto"):
        base_query = base_query.filter(created__lte=date_to)

    if (account_pk := request.GET.get("account")) \
            and request.GET.get("account").isdecimal():
        base_query = base_query.filter(account__id=account_pk)

    if (maincategory_pk := request.GET.get("category")) \
            and request.GET.get("category").isdecimal():
        base_query = base_query.filter(main_category__id=maincategory_pk)

    if (subcategory_pk := request.GET.get("subcategory")) \
            and request.GET.get("subcategory").isdecimal():
        base_query = base_query.filter(subcategory__id=subcategory_pk)

    if direction := request.GET.get("direction"):
        base_query = base_query.filter(amount__gt=0) if direction.lower() == "in" \
            else base_query.filter(amount__lt=0)

    return base_query


# TODO: use JsonResponse instead of Response
class TransactionView(viewsets.ViewSet):

    @classmethod
    def list(cls, request: Request) -> Response:
        queryset = get_transaction_query_set_from_request(request)
        serializer = TransactionDetailsSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @classmethod
    def create(cls, request: Request) -> Response:
        data = JSONParser().parse(request)
        if 'subcategory' in data.keys() \
                and not subcategory_owned_by_requester(data['subcategory'], request):
            return Response(
                data={"main_category": [
                    f"Invalid pk \"{data['subcategory']}\" - object does not exists."
                ]},
                status=status.HTTP_400_BAD_REQUEST
            )

        if 'account' in data.keys() \
                and not account_owned_by_requester(data['subcategory'], request):
            return Response(
                data={"main_category": [
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
