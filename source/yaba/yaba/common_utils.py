from functools import partial

from rest_framework.request import Request


def _object_is_owned_by_requester(reverse_field_name: str, object_id: int, request: Request) -> bool:
    return getattr(request.user, reverse_field_name) \
        .filter(id=object_id) \
        .exists()


main_category_owned_by_requester = partial(
    _object_is_owned_by_requester,
    'main_categories'
)

subcategory_owned_by_requester = partial(
    _object_is_owned_by_requester,
    'subcategories'
)

account_owned_by_requester = partial(
    _object_is_owned_by_requester,
    'accounts'
)
