from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from yaba.common_utils import main_category_owned_by_requester
from categories.serializers import (
    MainCategorySerializer,
    MainCategoryDetailsSerializer,
    SubCategorySerializer,
    SubCategoryDetailsSerializer,
)


class MainCategoryView(viewsets.ViewSet):

    @classmethod
    def list(cls, request: Request) -> Response:
        queryset = request.user.main_categories.all()
        serializer = MainCategorySerializer(queryset, many=True)
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

    # TODO: update

    @classmethod
    def destroy(cls, request: Request, pk=None) -> Response:
        queryset = request.user.main_categories.all()
        main_category = get_object_or_404(queryset, pk=pk)
        main_category.delete()
        return Response(data=dict(), status=status.HTTP_200_OK)


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

    # TODO: update

    @classmethod
    def destroy(cls, request: Request, pk=None) -> Response:
        queryset = request.user.subcategories.all()
        subcategories = get_object_or_404(queryset, pk=pk)
        subcategories.delete()
        return Response(data=dict(), status=status.HTTP_200_OK)
