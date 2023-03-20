from typing import TYPE_CHECKING

from rest_framework import serializers

from csvgenerator.models import Schema, SchemaColumn
from csvgenerator.serializers.schema_column import SchemaColumnSerializer

if TYPE_CHECKING:
    import datetime


class SchemaListSerializer(serializers.ModelSerializer):
    modified_at_date = serializers.SerializerMethodField()

    class Meta:
        model = Schema
        fields = ["id", "name", "modified_at_date"]

    def get_modified_at_date(self, obj: "Schema") -> "datetime.date":
        """
        Returns the date portion of the modified_at timestamp for the given Schema object.

        Args:
            obj (Schema): The Schema object for which to retrieve the modified date.

        Returns:
            datetime.date: The date portion of the modified_at timestamp.
        """

        return obj.modified_at.date()


class SchemaDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for the Schema model that includes all fields, including related SchemaColumn objects.
    """

    columns = SchemaColumnSerializer(many=True, source="schemacolumn_set")
    user_created = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Schema
        fields = (
            'id',
            "name",
            "column_separator",
            "string_character",
            "columns",
            "user_created",
        )

    def create(self, validated_data: dict) -> "Schema":
        """
        Create a new Schema instance and associated SchemaColumn instances from validated data.

        Args:
            validated_data (dict): The validated data to use for creating the Schema.

        Returns:
            Schema: The newly created Schema instance.
        """

        columns_data = validated_data.pop("schemacolumn_set")

        schema = Schema.objects.create(**validated_data)

        for column_data in columns_data:
            SchemaColumn.objects.create(schema=schema, **column_data)

        return schema

    def update(self, instance: "Schema", validated_data: dict) -> "Schema":
        """
        Update an existing Schema instance and associated SchemaColumn instances from validated data.

        Args:
            instance (Schema): The existing Schema instance to update.
            validated_data (dict): The validated data to use for updating the Schema.

        Returns:
            Schema: The updated Schema instance.
        """

        columns = validated_data.pop("schemacolumn_set", None)

        instance = super().update(instance, validated_data)

        instance.schemacolumn_set.all().delete()

        for column in columns:
            SchemaColumn.objects.create(schema=instance, **column)

        return instance

    def validate(self, data: dict) -> dict:
        user = self.context['request'].user
        name = data.get('name')

        if Schema.objects.filter(name=name, user_created=user).exists():
            raise serializers.ValidationError({'name': "Schema with this name already exists."})

        return data

    def validate_columns(self, value: list) -> list:
        """
        Validate the columns data for the Schema.

        Args:
            value (list): The columns data to validate.

        Raises:
            serializers.ValidationError: If there are duplicate column names or non-sequential ordering values.

        Returns:
            list: The validated columns data.
        """

        column_names_seen = set()
        ordering_set = set()

        for column in value:
            if column["name"] in column_names_seen:
                raise serializers.ValidationError("Column names must be unique.")

            column_names_seen.add(column["name"])
            ordering_set.add(column["order"])

        if ordering_set != set(range(1, len(ordering_set) + 1)):
            raise serializers.ValidationError(
                "Ordering values must start from 1 and be sequential without gaps."
            )

        return value
