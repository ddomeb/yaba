from rest_framework import serializers

from dashboard.models import SeriesData, AccountHistory


class SeriesDataSerializer(serializers.Serializer):
    value = serializers.IntegerField()
    name = serializers.DateTimeField()

    def create(self, validated_data):
        return SeriesData(**validated_data)

    def update(self, instance, validated_data):
        instance.value = validated_data.get('value', instance.value)
        instance.name = validated_data.get('name', instance.name)
        return instance


class AccountHistorySerializer(serializers.Serializer):
    name = serializers.CharField()
    series = SeriesDataSerializer(many=True)

    def create(self, validated_data):
        return AccountHistory(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.series = validated_data.get('series', instance.series)
        return instance
