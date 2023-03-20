from django.urls import path
from django.views.generic import TemplateView
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register("schemas", views.SchemaViewSet, basename="schemas")
router.register(
    "schema-datasets", views.SchemaDatasetViewSet, basename="schema-datasets"
)

urlpatterns = [
    path(
        "schema-create-metadata/",
        views.SchemaCreateFormMetadataView.as_view(),
        name="schema-create-form-metadata",
    ),
]

urlpatterns += router.urls

# urlpatterns = [
# Catch-all route to render index.html for any URL path
# path('<path:path>', TemplateView.as_view(template_name='index.html')),
# ]
