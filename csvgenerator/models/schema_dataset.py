from django.conf import settings
from django.db import models

from csvgenerator.constants import DatasetStatus
from csvgenerator.models.common import TimestampedModel


def schema_directory_path(instance: "SchemaDataset", filename: str) -> str:
    """
    Returns the directory path for storing a file for the given schema instance.

    Args:
        instance (SchemaDataset): The schema instance for which the file is being uploaded.
        filename (str): The name of the file being uploaded.

    Returns:
        str: The directory path where the file will be uploaded.
    """

    return f"datasets/schema_{instance.schema.id}/{filename}"


class SchemaDataset(TimestampedModel):
    """
    Represents a dataset generated from a 'Schema' model.
    """

    schema = models.ForeignKey("csvgenerator.Schema", on_delete=models.CASCADE)
    status = models.CharField(max_length=32, choices=DatasetStatus.choices())
    media_file = models.FileField(
        blank=True, null=True, upload_to=schema_directory_path
    )
