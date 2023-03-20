from rest_framework import generics, mixins, viewsets

from csvgenerator.models import SchemaDataset
from csvgenerator.serializers.schema_dataset import SchemaDatasetSerializer


class SchemaDatasetViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = SchemaDataset.objects.all()
    serializer_class = SchemaDatasetSerializer

    def get_queryset(self):
        return self.queryset.filter(schema__user_created=self.request.user).order_by(
            "-created_at"
        )
