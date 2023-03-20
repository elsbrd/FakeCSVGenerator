from typing import TYPE_CHECKING

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from rest_framework.views import APIView

from csvgenerator.constants import ColumnDataType, ColumnSeparator, StringCharacter
from csvgenerator.models import Schema
from csvgenerator.serializers import SchemaDetailSerializer, SchemaListSerializer
from csvgenerator.serializers.schema_dataset import SchemaDatasetSerializer
from csvgenerator.utils import generate_schema_dataset

if TYPE_CHECKING:
    from rest_framework.request import Request


class SchemaViewSet(viewsets.ModelViewSet):
    queryset = Schema.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user_created=self.request.user).order_by("name")

    def get_serializer_class(self):
        if self.action == "list":
            return SchemaListSerializer
        return SchemaDetailSerializer

    @action(detail=True, methods=["POST"], url_path="generate-dataset")
    def generate_dataset(self, request: "Request", pk=None) -> Response:
        """
        Generates a dataset for the schema with the specified number of rows.

        Args:
            request: The HTTP request.
            pk: The primary key of the schema.

        Returns:
            A JSON response with the generated dataset.

        Raises:
            ValidationError: If the number of rows is not a positive integer.
        """

        schema = self.get_object()
        number_of_rows = self._get_number_of_rows()
        if not number_of_rows:
            raise ValidationError(
                {"number_of_rows": ["Must be a greater than zero number."]}
            )

        dataset = generate_schema_dataset(schema, number_of_rows=int(number_of_rows))
        serializer = SchemaDatasetSerializer(
            instance=dataset, context={"request": request}
        )

        return Response(serializer.data, status=HTTP_201_CREATED)

    @action(detail=True)
    def datasets(self, request: "Request", pk=None) -> Response:
        """
        Returns a list of datasets for the schema.

        Args:
            request: The HTTP request.
            pk: The primary key of the schema.

        Returns:
            A JSON response with the datasets.
        """

        schema = self.get_object()
        datasets = schema.schemadataset_set.order_by("-created_at")
        serializer = SchemaDatasetSerializer(
            datasets, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def _get_number_of_rows(self) -> int:
        """
        Returns the number of rows from the request data.

        Raises:
            ValidationError: If the number of rows is not a positive integer.
        """

        number_of_rows = self.request.data.get("number_of_rows")
        if not number_of_rows or int(number_of_rows) <= 0:
            raise ValidationError(
                {"number_of_rows": ["Must be a positive integer greater than zero."]}
            )

        return int(number_of_rows)


class SchemaCreateFormMetadataView(APIView):
    """
    This class defines a view to retrieve metadata for schema creation form.
    """

    def get(self, request: "Request") -> Response:
        context = {
            "column_separator": {"choices": ColumnSeparator.choices()},
            "string_character": {"choices": StringCharacter.choices()},
            "column_data_type": {"choices": ColumnDataType.choices()},
        }
        return Response(context)
