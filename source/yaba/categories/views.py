from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from accounts.models import Account
from transactions.models import Transaction
from yaba.common_utils import main_category_owned_by_requester
from categories.serializers import (
    MainCategorySerializer,
    MainCategoryDetailsSerializer,
    SubCategorySerializer,
    SubCategoryDetailsSerializer,
)


def revert_transactions_for_main_category(pk: int) -> None:
    revert_transactions(
        Transaction.objects.filter(subcategory__main_category__id=pk)
    )


def revert_transactions_for_sub_category(pk: int) -> None:
    revert_transactions(
        Transaction.objects.filter(subcategory__id=pk)
    )


def revert_transactions(query: QuerySet) -> None:
    for tr in query:
        account: Account = Account.objects.get(pk=tr.account.id)
        account.balance -= tr.amount
        account.save()
        tr.delete()


class MainCategoryView(viewsets.ViewSet):

    @classmethod
    def list(cls, request: Request) -> Response:
        base_queryset = request.user.main_categories.all()

        if is_income := request.GET.get('is_income'):
            if is_income.tolower() == 'true':
                base_queryset.filter(isIncome=True)
            if is_income.tolower() == 'false':
                base_queryset.filter(isIncome=False)

        serializer = MainCategorySerializer(base_queryset, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    @classmethod
    def create(cls, request: Request) -> Response:
        data = JSONParser().parse(request)
        serializer = MainCategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @classmethod
    def retrieve(cls, request: Request, pk=None) -> Response:
        queryset = request.user.main_categories.all()
        category = get_object_or_404(queryset, pk=pk)
        serializer = MainCategoryDetailsSerializer(category)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    @classmethod
    def update(cls, request, pk=None) -> Response:
        queryset = request.user.main_categories.all()
        main_category = get_object_or_404(queryset, pk=pk)
        data = JSONParser().parse(request)
        serializer = MainCategorySerializer(main_category, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @classmethod
    def destroy(cls, request: Request, pk=None) -> Response:
        queryset = request.user.main_categories.all()
        main_category = get_object_or_404(queryset, pk=pk)
        revert_transactions_for_main_category(main_category.id)
        main_category.delete()
        return Response(data={}, status=status.HTTP_200_OK)


class SubCategoryView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, ]

    # Check if the request sender actually owns the main category referenced in the posted subcategory.
    # If not send the error message that does not show if the passed main category ID is owned by a different user
    # or it is non-existent.
    @classmethod
    def create(cls, request: Request) -> Response:
        data = JSONParser().parse(request)
        if "main_category" in data.keys() \
                and not main_category_owned_by_requester(data['main_category'], request):
            return Response(
                data={"main_category": [
                    f"Invalid pk \"{data['main_category']}\" - object does not exists."
                ]},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SubCategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @classmethod
    def retrieve(cls, request: Request, pk=None) -> Response:
        queryset = request.user.subcategories.all()
        subcategory = get_object_or_404(queryset, pk=pk)
        serializer = SubCategoryDetailsSerializer(subcategory)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    @classmethod
    def update(cls, request, pk=None) -> Response:
        queryset = request.user.subcategories.all()
        subcategory = get_object_or_404(queryset, pk=pk)
        data = JSONParser().parse(request)
        serializer = MainCategorySerializer(subcategory, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @classmethod
    def destroy(cls, request: Request, pk=None) -> Response:
        queryset = request.user.subcategories.all()
        subcategory = get_object_or_404(queryset, pk=pk)
        revert_transactions_for_sub_category(subcategory.id)
        subcategory.delete()
        return Response(data={}, status=status.HTTP_200_OK)
