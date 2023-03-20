from django.db import models


class TimestampedModel(models.Model):
    """
    Abstract base model that provides timestamp fields for when an instance was created and last modified.
    """

    modified_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
