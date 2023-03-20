from enum import Enum


class BaseChoicesEnum(Enum):
    def __str__(self):
        return self.value

    @classmethod
    def choices(cls):
        return [(x.value, x.name.replace("_", " ").title()) for x in cls]


class ColumnDataType(BaseChoicesEnum):
    FULL_NAME = "full_name"
    JOB = "job"
    EMAIL = "email"
    DOMAIN_NAME = "domain_name"
    PHONE_NUMBER = "phone_number"
    COMPANY_NAME = "company_name"
    TEXT = "text"
    INTEGER = "integer"
    ADDRESS = "address"
    DATE = "date"


class ColumnSeparator(BaseChoicesEnum):
    COMMA = ","
    PIPE = "|"
    SEMICOLON = ";"
    TAB = "\t"


class StringCharacter(BaseChoicesEnum):
    SINGLE_QUOTE = "'"
    DOUBLE_QUOTE = '"'
    BACKTICK = "`"


class DatasetStatus(BaseChoicesEnum):
    PROCESSING = "processing"
    READY = "ready"
