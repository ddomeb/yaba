from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.parsers import JSONParser
from rest_framework.request import Request
from rest_framework.response import Response

from accounts.serializers import AccountSerializer


class AccountView(viewsets.ViewSet):
    @classmethod
    def list(cls, request: Request) -> Response:
        queryset = cls._get_account_query_set_from_request(request)
        serializer = AccountSerializer(queryset, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    @classmethod
    def create(cls, request: Request) -> Response:
        data = JSONParser().parse(request)
        serializer = AccountSerializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @classmethod
    def retrieve(cls, request: Request, pk=None) -> Response:
        queryset = request.user.accounts.all()
        account = get_object_or_404(queryset, pk=pk)
        serializer = AccountSerializer(account)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    @classmethod
    def update(cls, request: Request, pk=None) -> Response:
        queryset = request.user.accounts.all()
        account = get_object_or_404(queryset, pk=pk)
        data = JSONParser().parse(request)
        serializer = AccountSerializer(account, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @classmethod
    def destroy(cls, request: Request, pk=None) -> Response:
        queryset = request.user.accounts.all()
        account = get_object_or_404(queryset, pk=pk)
        account.delete()
        return Response(data={}, status=status.HTTP_200_OK)

    @classmethod
    def _get_account_query_set_from_request(cls, request: Request) -> QuerySet:
        base_query = request.user.accounts.all()
        if acc_t := request.GET.get("type"):
            base_query = base_query.filter(type=acc_t)
        return base_query
