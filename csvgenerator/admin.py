from django.contrib import admin

from csvgenerator.models import Schema, SchemaColumn, SchemaDataset


class SchemaColumnInline(admin.TabularInline):
    model = SchemaColumn
    extra = 1


@admin.register(Schema)
class SchemaAdmin(admin.ModelAdmin):
    list_display = ("name", "user_created", "modified_at", "created_at")
    search_fields = ("name", "user_created__username")
    readonly_fields = ("modified_at", "created_at")
    inlines = [SchemaColumnInline]


@admin.register(SchemaColumn)
class SchemaColumnAdmin(admin.ModelAdmin):
    list_display = ("name", "schema", "data_type", "order")
    search_fields = ("name", "schema__name")
    readonly_fields = ("modified_at", "created_at")
    list_filter = ("schema",)


@admin.register(SchemaDataset)
class SchemaDatasetAdmin(admin.ModelAdmin):
    list_display = ("id", "schema", "status", "media_file", "modified_at", "created_at")
    readonly_fields = ("modified_at", "created_at", "media_file")
    list_filter = ("schema",)
