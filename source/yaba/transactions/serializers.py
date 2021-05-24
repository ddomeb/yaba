from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField

from accounts.models import Account
from accounts.serializers import AccountSerializer
from categories.models import SubCategory
from categories.serializers import SubCategorySerializer
from transactions.models import Transaction


class TransactionDetailsSerializer(serializers.ModelSerializer):
    subcategory = SubCategorySerializer()
    account = AccountSerializer()

    class Meta:
        model = Transaction
        fields = (
            "note",
            "amount",
            "subcategory",
            "account",
            "id",
            "created",
        )
        read_only_fields = ("created", "id", "subcategory", "account")


class TransactionSerializer(serializers.ModelSerializer):
    subcategory = PrimaryKeyRelatedField(queryset=SubCategory.objects.all())
    account = PrimaryKeyRelatedField(queryset=Account.objects.all())

    class Meta:
        model = Transaction
        fields = (
            "note",
            "amount",
            "subcategory",
            "account",
            "id",
        )
        read_only_fields = ("created", "id", "subcategory", "account")

    def to_representation(self, instance):
        self.fields["subcategory"] = SubCategorySerializer()
        self.fields["account"] = AccountSerializer()
        return super(TransactionSerializer, self).to_representation(instance)
