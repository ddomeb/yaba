from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .serializers import AccountSerializer


# TODO: use JsonResponse instead of Response
class AccountView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, ]

    @classmethod
    def list(cls, request: Request) -> Response:
        queryset = request.user.accounts.all()
        serializer = AccountSerializer(queryset, many=True)
        return Response(data=serializer.data, status=200)

    @classmethod
    def create(cls, request: Request) -> Response:
        data = JSONParser().parse(request)
        serializer = AccountSerializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(data=serializer.data, status=201)
        return Response(data=serializer.errors, status=400)

    @classmethod
    def retrieve(cls, request: Request, pk=None) -> Response:
        queryset = request.user.accounts.all()
        account = get_object_or_404(queryset, pk=pk)
        serializer = AccountSerializer(data=account)
        if serializer.is_valid():
            return Response(data=serializer.data, status=200)

    @classmethod
    def update(cls, request: Request, pk=None) -> Response:
        # TODO can not modify created date, owner(?)
        # TODO in case of modified balance should add balancing transaction
        queryset = request.user.accounts.all()
        account = get_object_or_404(queryset, pk=pk)
        data = JSONParser().parse(request)
        serializer = AccountSerializer(account, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=201)
        return Response(data=serializer.errors, status=400)

    @classmethod
    def destroy(cls, request: Request, pk=None) -> Response:
        queryset = request.user.accounts.all()
        account = get_object_or_404(queryset, pk=pk)
        account.delete()
        return Response(data=dict(), status=200)
