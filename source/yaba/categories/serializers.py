from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField

from categories.models import MainCategory, SubCategory


class MainCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ("name", "id", "description", "isIncome")
        read_only_fields = ("id",)


class SubCategorySerializer(serializers.ModelSerializer):
    main_category = PrimaryKeyRelatedField(queryset=MainCategory.objects.all())

    class Meta:
        model = SubCategory
        fields = ("name", "id", "main_category", "description")
        read_only_fields = (
            "id",
            "main_category",
        )

    def to_representation(self, instance):
        self.fields["main_category"] = MainCategorySerializer()
        return super(SubCategorySerializer, self).to_representation(instance)


class SubCategoryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ("name", "id", "description")
        read_only_fields = ("id",)


class MainCategoryDetailsSerializer(serializers.ModelSerializer):
    subcategories = SubCategoryListSerializer(many=True, read_only=True)

    class Meta:
        model = MainCategory
        fields = ("name", "subcategories", "id", "description", "isIncome")
        read_only_fields = ("id", "subcategories", "isIncome")


class SubCategoryDetailsSerializer(serializers.ModelSerializer):
    main_category = MainCategorySerializer(read_only=True)

    class Meta:
        model = SubCategory
        fields = ("name", "main_category", "id", "description")
        read_only_fields = (
            "id",
            "main_category",
        )
