import datetime

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from csvgenerator.constants import ColumnDataType
from csvgenerator.models.common import TimestampedModel


class SchemaColumn(TimestampedModel):
    """
    Represents a column within a 'Schema' model.
    """

    schema = models.ForeignKey("csvgenerator.Schema", on_delete=models.CASCADE)

    name = models.CharField(max_length=128)
    data_type = models.CharField(max_length=32, choices=ColumnDataType.choices())
    order = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    min_value = models.CharField(
        max_length=10,
        blank=True,
    )
    max_value = models.CharField(
        max_length=10,
        blank=True,
    )

    @property
    def min_value_python(self):
        return _min_max_value_to_python(self.min_value)

    @property
    def max_value_python(self):
        return _min_max_value_to_python(self.max_value)

    def clean(self):
        super().clean()

        if self.data_type in (ColumnDataType.TEXT.value, ColumnDataType.INTEGER.value):
            if self.min_value and not self.min_value.isnumeric():
                raise ValidationError({"min_value": ["Min value must be an integer"]})
            if self.max_value and not self.max_value.isnumeric():
                raise ValidationError({"max_value": ["Max value must be an integer"]})
            if (
                self.min_value
                and self.max_value
                and int(self.min_value) > int(self.max_value)
            ):
                raise ValidationError({"max_value": ["Max value must be ≥ min value."]})

        elif self.data_type == ColumnDataType.DATE.value:
            min_value, max_value = None, None

            if self.min_value:
                try:
                    min_value = _parse_date_range_filter(self.min_value)
                except ValueError:
                    raise ValidationError(
                        {"min_value": ["Pass min date in YYYY-MM-DD format."]}
                    )

            if self.max_value:
                try:
                    max_value = _parse_date_range_filter(self.max_value)
                except ValueError:
                    raise ValidationError(
                        {"max_value": ["Pass max date in YYYY-MM-DD format."]}
                    )

            if min_value and max_value and min_value > max_value:
                raise ValidationError({"max_value": ["Max date must be ≥ min date."]})

        elif self.min_value or self.max_value:
            raise ValidationError(
                "Min and max values are not allowed for this data type."
            )

    class Meta:
        ordering = ("order",)
        constraints = [
            # ensures that each Schema has unique column names
            models.UniqueConstraint(
                fields=["schema", "name"],
                name="unique_column_name_per_schema",
            ),
            # ensures that each Schema has unique column order values
            models.UniqueConstraint(
                fields=["schema", "order"],
                name="unique_column_order_per_schema",
            ),
        ]


def _min_max_value_to_python(value):
    if not value:
        return

    elif value.isdigit():
        return int(value)

    return _parse_date_range_filter(value)


def _parse_date_range_filter(value):
    return datetime.datetime.strptime(value, "%Y-%m-%d").date()
