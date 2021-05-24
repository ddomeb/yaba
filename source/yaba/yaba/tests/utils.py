from datetime import datetime

import pytz

from accounts.models import Account
from categories.models import MainCategory, SubCategory
from transactions.models import Transaction


def add_test_category(owner, name="testcategory", description="testcategory", is_income=False):
    test_category = MainCategory(name=name, description=description, owner=owner, isIncome=is_income)
    test_category.save()
    return test_category


def add_test_subcategory(owner, name="testsubcategory", description="testsubcategory", main_category_pk=1):
    main_category = MainCategory.objects.get(pk=main_category_pk)
    test_subcategory = SubCategory(name=name, description=description, main_category=main_category, owner=owner)
    test_subcategory.save()
    return test_subcategory


def add_test_transaction(owner, note="note", amount=1000, created=None, subcategory_pk=1, account_pk=1):
    created = created if created else datetime.now(pytz.timezone("Europe/Budapest"))
    subcategory = SubCategory.objects.get(pk=subcategory_pk)
    account = Account.objects.get(pk=account_pk)
    test_transaction = Transaction(owner=owner, note=note, amount=amount, subcategory=subcategory, account=account)
    test_transaction.save()
    test_transaction.created = created
    test_transaction.save()
    return test_transaction


def add_test_account(owner, name="testaccount", description="testaccount", balance=1000, type="account"):
    test_account = Account(name=name, description=description, balance=balance, type=type, owner=owner)
    test_account.save()
    return test_account
