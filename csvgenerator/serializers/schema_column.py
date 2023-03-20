from django.core.exceptions import ValidationError
from rest_framework import serializers

from csvgenerator.models import Schema, SchemaColumn


class SchemaColumnSerializer(serializers.ModelSerializer):
    """
    Serializer for SchemaColumn model.
    """

    class Meta:
        model = SchemaColumn
        exclude = ("id", "schema", "created_at", "modified_at")

    def validate(self, data: dict) -> dict:
        """
        Validate the data for SchemaColumn instance creation.
        We run model .clean() method to ensure that correct extra args were pased.

        Args:
            data (dict): The data to be validated.

        Returns:
            dict: The validated data.

        Raises:
            serializers.ValidationError: If the data is not valid.
        """

        instance = SchemaColumn(**data)

        try:
            instance.clean()

        except ValidationError as e:
            if hasattr(e, "message_dict"):
                raise serializers.ValidationError(e.message_dict)
            raise serializers.ValidationError(e)

        return data
