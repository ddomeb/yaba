from rest_framework import serializers

from accounts.models import Account


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        depth = 1
        fields = (
            "name",
            "description",
            "balance",
            "created",
            "type",
            "id",
        )
        read_only_fields = (
            "created",
            "id",
        )
