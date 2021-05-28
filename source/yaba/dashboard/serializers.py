from rest_framework import serializers

from dashboard.models import CashFlowStat


class CashFlowStatSerializer(serializers.Serializer):
    income = serializers.IntegerField()
    expense = serializers.IntegerField()

    def create(self, validated_data):
        return CashFlowStat(**validated_data)

    def update(self, instance, validated_data):
        instance.income = validated_data.get("income", instance.income)
        instance.expense = validated_data.get("income", instance.expense)
        return instance


class MonthlyStatSerializer(serializers.Serializer):
    thisMonth = CashFlowStatSerializer()
    prevMonth = CashFlowStatSerializer()

    def create(self, validated_data):
        return MonthlyStatSerializer(**validated_data)

    def update(self, instance, validated_data):
        instance.thisMonth = validated_data.get("thisMonth", instance.thisMonth)
        instance.prevMonth = validated_data.get("prevMonth", instance.prevMonth)
        return instance
