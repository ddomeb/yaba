import datetime
import typing
from functools import partial

import pytz
from rest_framework.request import Request


def _object_is_owned_by_requester(reverse_field_name: str, object_id: int, request: Request) -> bool:
    return getattr(request.user, reverse_field_name).filter(id=object_id).exists()


main_category_owned_by_requester = partial(_object_is_owned_by_requester, "main_categories")
subcategory_owned_by_requester = partial(_object_is_owned_by_requester, "subcategories")
account_owned_by_requester = partial(_object_is_owned_by_requester, "accounts")


def get_this_month_date_range(timezone_string: str = "Europe/Budapest")\
        -> typing.Tuple[datetime.datetime, datetime.datetime]:
    tz = pytz.timezone(timezone_string)
    to_date = datetime.datetime.now(tz)
    from_date = to_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return from_date, to_date


def get_prev_month_date_range(timezone_string: str = "Europe/Budapest") \
        -> typing.Tuple[datetime.datetime, datetime.datetime]:
    tz = pytz.timezone(timezone_string)
    to_date = datetime.datetime.now(tz).replace(day=1, hour=0, minute=0, second=0, microsecond=0) - datetime.timedelta(
        microseconds=1
    )
    from_date = to_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return from_date, to_date
