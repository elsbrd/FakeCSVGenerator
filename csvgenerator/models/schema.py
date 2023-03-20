from django.db import models

from csvgenerator.constants import ColumnSeparator, StringCharacter
from csvgenerator.models.common import TimestampedModel


class Schema(TimestampedModel):
    """
    Represents a schema in our database.
    It includes information about the schema's name, column separator, string character, and user creator.
    """

    name = models.CharField(max_length=255)
    column_separator = models.CharField(
        max_length=1, choices=ColumnSeparator.choices(), default=ColumnSeparator.COMMA
    )
    string_character = models.CharField(
        max_length=1,
        choices=StringCharacter.choices(),
        default=StringCharacter.DOUBLE_QUOTE,
    )
    user_created = models.ForeignKey("authentication.User", on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "user_created"],
                name="unique_schema_name_owner",
            )
        ]
