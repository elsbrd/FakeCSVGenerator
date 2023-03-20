import csv
import datetime
import random
import threading
from io import StringIO
from typing import TYPE_CHECKING, Optional

from django.core.files.base import ContentFile
from faker import Faker

from csvgenerator.constants import ColumnDataType, DatasetStatus
from csvgenerator.models import SchemaDataset

if TYPE_CHECKING:
    from csvgenerator.models import Schema


DATE_RANGE_MIN = datetime.date(1970, 1, 1)
DATE_RANGE_MAX = datetime.date(2030, 1, 1)


def generate_schema_dataset(schema: "Schema", number_of_rows: int) -> SchemaDataset:
    """
    Generates a new SchemaDataset object with the given schema and number of rows,
    and creates a new thread to generate the dataset.

    Args:
        schema (Model): The schema to use for the dataset.
        number_of_rows (int): The number of rows to generate in the dataset.

    Returns:
        SchemaDataset: The new SchemaDataset object that was created.
    """

    dataset = SchemaDataset.objects.create(
        schema=schema, status=DatasetStatus.PROCESSING
    )

    _create_dataset_generation_task(schema, number_of_rows, dataset)

    return dataset


def _create_dataset_generation_task(
    schema: "Schema", number_of_rows: int, dataset: SchemaDataset
) -> None:
    """
    Creates a new thread to generate the dataset using the given schema and number of rows.

    Args:
        schema (Model): The schema to use for the dataset.
        number_of_rows (int): The number of rows to generate in the dataset.
        dataset (SchemaDataset): The SchemaDataset object to update during generation.
    """

    thread = threading.Thread(
        target=_generate_dataset, args=(schema, number_of_rows, dataset)
    )
    thread.start()


def _generate_dataset(
    schema: "Schema", number_of_rows: int, schema_dataset: SchemaDataset
):
    """
    Generates a dataset with the given schema and number of rows, and saves it as a CSV
    file associated with the given SchemaDataset object. Updates the status of the
    SchemaDataset object as necessary.

    Args:
        schema (Schema): The schema to use for the dataset.
        number_of_rows (int): The number of rows to generate in the dataset.
        schema_dataset (SchemaDataset): The SchemaDataset object to update and associate
            with the generated CSV file.
    """

    fake = Faker()

    columns_set = schema.schemacolumn_set.order_by("order")

    file_rows = []

    headers = list(columns_set.values_list("name", flat=True))
    file_rows.append(headers)

    for i in range(number_of_rows):
        row = []

        for column in columns_set:
            if column.data_type == ColumnDataType.FULL_NAME.value:
                row.append(fake.name())

            elif column.data_type == ColumnDataType.JOB.value:
                row.append(fake.job())

            elif column.data_type == ColumnDataType.EMAIL.value:
                row.append(fake.email())

            elif column.data_type == ColumnDataType.DOMAIN_NAME.value:
                row.append(fake.domain_name())

            elif column.data_type == ColumnDataType.PHONE_NUMBER.value:
                row.append(fake.phone_number())

            elif column.data_type == ColumnDataType.COMPANY_NAME.value:
                row.append(fake.company())

            elif column.data_type == ColumnDataType.TEXT.value:
                sentences_num = random.randint(
                    int(column.min_value_python or 1),
                    int(column.max_value_python or 20),
                )
                row.append(" ".join(fake.sentences(sentences_num)))

            elif column.data_type == ColumnDataType.INTEGER.value:
                row.append(
                    str(
                        random.randint(
                            int(column.min_value_python or -1000000),
                            int(column.max_value_python or 1000000),
                        )
                    )
                )

            elif column.data_type == ColumnDataType.ADDRESS.value:
                row.append(fake.address())

            elif column.data_type == ColumnDataType.DATE.value:
                row.append(
                    _get_random_date_in_range(
                        date_min=column.min_value_python,
                        date_max=column.max_value_python,
                    )
                )

        file_rows.append(row)

    csv_buffer = StringIO()
    writer = csv.writer(
        csv_buffer, delimiter=schema.column_separator, quotechar=schema.string_character
    )
    writer.writerows(file_rows)

    file_name = f"dataset_{schema_dataset.pk}.csv"
    csv_file_content = csv_buffer.getvalue().encode("utf-8")
    schema_dataset.media_file.save(file_name, ContentFile(csv_file_content))
    schema_dataset.status = DatasetStatus.READY
    schema_dataset.save()


def _get_random_date_in_range(
    date_min: Optional[datetime.date] = None, date_max: Optional[datetime.date] = None
) -> str:
    """
    Returns a random date between date_min and date_max (inclusive) as a string in the
    format "YYYY-MM-DD". If date_min is None, the minimum date is set to January 1, 1900.
    If date_max is None, the maximum date is set to January 1, 2030.

    Args:
        date_min (Optional[datetime.date]): The minimum date for the random date range.
        date_max (Optional[datetime.date]): The maximum date for the random date range.

    Returns:
        str: A random date between date_min and date_max (inclusive) as a string in the format "YYYY-MM-DD".
    """

    if date_min is None:
        date_min = DATE_RANGE_MIN

    if date_max is None:
        date_max = DATE_RANGE_MAX

    time_between_dates = date_max - date_min
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = date_min + datetime.timedelta(days=random_number_of_days)

    return random_date.strftime("%Y-%m-%d")
