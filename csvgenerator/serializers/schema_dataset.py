from rest_framework import serializers

from csvgenerator.models.schema_dataset import SchemaDataset


class SchemaDatasetSerializer(serializers.ModelSerializer):
    """
    Serializer for the SchemaDataset model, which includes the file name and created time of the dataset.
    """

    created_at_time = serializers.SerializerMethodField()
    filename = serializers.SerializerMethodField()

    class Meta:
        model = SchemaDataset
        fields = (
            "id",
            "status",
            "filename",
            "media_file",
            "created_at_time",
        )

    def get_created_at_time(self, obj: "SchemaDataset"):
        """
        Returns a formatted string representing the creation time of the given `SchemaDataset` object.

        Args:
            obj (SchemaDataset): The `SchemaDataset` object for which to get the creation time.

        Returns:
            str: A formatted string representing the creation time of the `SchemaDataset` object. The format is
            "%d %b %Y %I:%M%p", which stands for day, month (abbreviated), year, hour (12-hour clock), minute, and AM/PM.
        """

        return obj.created_at.strftime("%d %b %Y %I:%M%p")

    def get_filename(self, obj: "SchemaDataset") -> str:
        """
        Returns the filename of the media file associated with the given `SchemaDataset` object.

        Args:
            obj (SchemaDataset): The `SchemaDataset` object for which to get the filename.

        Returns:
            str: The filename of the media file associated with the `SchemaDataset` object,
                or an empty string if no media file is associated with the object.
        """

        return obj.media_file.name.split("/")[-1] if obj.media_file else ""
