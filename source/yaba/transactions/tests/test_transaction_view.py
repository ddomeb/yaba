from datetime import datetime, timedelta

import pytz
from django.test import RequestFactory
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from transactions.models import Transaction
from transactions.views import TransactionView
from yaba.tests.utils import add_test_account, add_test_category, add_test_subcategory, add_test_transaction


class TransactionViewUnitTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("testuser", "testemail", "testpass")
        self.factory = RequestFactory()
        self.account = add_test_account(self.user)
        self.main_category = add_test_category(self.user)
        self.subcategory = add_test_subcategory(self.user, main_category_pk=self.main_category.pk)
        self.transaction = add_test_transaction(
            self.user, subcategory_pk=self.subcategory.pk, account_pk=self.account.pk
        )
        self.view = TransactionView()

    def test_list_all_transactions(self):
        request = self.factory.get("/transactions")
        request.user = self.user
        self.view.setup(request)

        response = self.view.list(request)

        self.assertEqual(response.status_code, 200, "Transaction listing HTTP 200")
        self.assertEqual(len(response.data), 1, "Transaction listing response contains single transaction")
        self.assertEqual(response.data[0]["note"], "note", "Test transaction listed")

    def test_income_and_expense_transactions_listing(self):
        _ = add_test_transaction(owner=self.user, amount=-1000)
        for query in "in", "out", None:
            request = self.factory.get("/transactions" + f"?direction={query}" if query else "")
            request.user = self.user
            self.view.setup(request)

            response = self.view.list(request)

        self.assertEqual(response.status_code, 200, "Transaction listing HTTP 200")
        self.assertEqual(len(response.data), 1 if query else 2)
        if query:
            self.assertEqual(response.data[0]["amount"], 1000 if query == "in" else -1000, "Test transaction listed")
        else:
            self.assertCountEqual([tr["amount"] for tr in response.data], [1000, -1000])

    def test_list_transactions_by_account(self):
        new_account = add_test_account(owner=self.user, name="new_account")
        _ = add_test_transaction(owner=self.user, account_pk=new_account.pk)
        for account_id in self.account.pk, new_account.pk, new_account.pk + 1:
            request = self.factory.get(f"/transactions?account={account_id}")
            request.user = self.user
            self.view.setup(request)

            response = self.view.list(request)

            self.assertEqual(response.status_code, 200, "Transaction listing HTTP 200")
            self.assertEqual(len(response.data), 1 if account_id in (self.account.pk, new_account.pk) else 0)
            if account_id in (self.account.pk, new_account.pk):
                self.assertEqual(
                    response.data[0]["account"]["id"],
                    self.account.pk if account_id == self.account.pk else new_account.pk,
                )

    def test_list_transactions_by_main_category(self):
        new_category = add_test_category(owner=self.user, name="new_category")
        new_subcategory = add_test_subcategory(owner=self.user, name="new_sub", main_category_pk=new_category.pk)
        _ = add_test_transaction(owner=self.user, subcategory_pk=new_subcategory.pk)
        for category_id in self.main_category.pk, new_category.pk, new_category.pk + 42:
            request = self.factory.get(f"/transactions?category={category_id}")
            request.user = self.user
            self.view.setup(request)

            response = self.view.list(request)

            self.assertEqual(response.status_code, 200, "Transaction listing HTTP 200")
            self.assertEqual(len(response.data), 1 if category_id in (self.main_category.pk, new_category.pk) else 0)

    def test_list_transactions_by_subcategory(self):
        new_category = add_test_category(owner=self.user, name="new_category")
        new_subcategory = add_test_subcategory(owner=self.user, name="new_sub", main_category_pk=new_category.pk)
        _ = add_test_transaction(owner=self.user, subcategory_pk=new_subcategory.pk)
        for category_id in self.subcategory.pk, new_subcategory.pk, new_subcategory.pk + 42:
            request = self.factory.get(f"/transactions?subcategory={category_id}")
            request.user = self.user
            self.view.setup(request)

            response = self.view.list(request)

            self.assertEqual(response.status_code, 200, "Transaction listing HTTP 200")
            self.assertEqual(len(response.data), 1 if category_id in (self.subcategory.pk, new_subcategory.pk) else 0)

    def test_list_transactions_by_date(self):
        new_transaction = add_test_transaction(
            owner=self.user,
            note="new note",
            amount=1000,
            subcategory_pk=self.subcategory.pk,
            account_pk=self.account.pk,
            created=datetime.now(pytz.timezone("Europe/Budapest")) - timedelta(days=2),
        )

        date_list_test_cases = [
            {
                "datefrom": None,
                "dateto": None,
                "expected_count": 2,
                "expected_notes": [self.transaction.note, new_transaction.note],
                "tc_name": "Should contain all transactions",
            },
            {
                "datefrom": datetime.now() - timedelta(days=1),
                "dateto": None,
                "expected_count": 1,
                "expected_notes": [
                    self.transaction.note,
                ],
                "tc_name": "Should contain only new transaction",
            },
            {
                "datefrom": None,
                "dateto": datetime.now() - timedelta(days=1),
                "expected_count": 1,
                "expected_notes": [
                    new_transaction.note,
                ],
                "tc_name": "Should contain only old transaction",
            },
            {
                "datefrom": datetime.now() - timedelta(days=3),
                "dateto": datetime.now() - timedelta(days=4),
                "expected_count": 0,
                "expected_notes": [],
                "tc_name": "Should not contain any transactions",
            },
        ]

        for tc in date_list_test_cases:
            url = "transactions/"
            if tc["datefrom"] or tc["dateto"]:
                url += "?"
                if tc["datefrom"]:
                    url += f"&datefrom={tc['datefrom'].isoformat()}"
                if tc["dateto"]:
                    url += f"&dateto={tc['dateto'].isoformat()}"

            request = self.factory.get(url)
            request.user = self.user
            self.view.setup(request)

            response = self.view.list(request)

            self.assertEqual(response.status_code, 200)
            self.assertCountEqual([tr["note"] for tr in response.data], tc["expected_notes"], tc["tc_name"])

    def test_create_valid_transaction(self):
        data = {"note": "new note", "amount": -1000, "subcategory": self.subcategory.pk, "account": self.account.pk}
        request = self.factory.post("/transactions/", data, content_type="application/json")
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 201, "Transaction create HTTP 201")
        self.assertEqual(self.user.transactions.count(), 2, "Transaction added")
        self.assertEqual(
            self.user.transactions.filter(note="new note").count(), 1, "Transaction added with correct note"
        )

    def test_transaction_create_validation_errors(self):
        request = self.factory.post("/transactions/", {}, content_type="application/json")
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 400, "Transaction create failed HTTP 400")
        self.assertCountEqual(list(response.data.keys()), ["subcategory", "account", "amount"])

    def test_cannot_create_transaction_for_other_users_account(self):
        new_user = User.objects.create_user("new_user")
        new_account = add_test_account(new_user)
        data = {"note": "new note", "amount": 1000, "subcategory": self.subcategory.pk, "account": new_account.pk}
        request = self.factory.post("/transactions/", data, content_type="application/json")
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 400, "Transaction create failed HTTP 400")
        self.assertCountEqual(list(response.data.keys()), ["account"])
        self.assertEqual(self.user.transactions.count(), 1)
        self.assertEqual(Transaction.objects.count(), 1)

    def test_cannot_create_transaction_for_other_users_subcategory(self):
        new_user = User.objects.create_user("new_user")
        new_subcategory = add_test_category(new_user)
        new_subcategory = add_test_subcategory(new_user, main_category_pk=new_subcategory.pk)
        data = {"note": "new note", "amount": 1000, "subcategory": new_subcategory.pk, "account": self.account.pk}
        request = self.factory.post("/transactions/", data, content_type="application/json")
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 400, "Transaction create failed HTTP 400")
        self.assertCountEqual(list(response.data.keys()), ["subcategory"])
        self.assertEqual(self.user.transactions.count(), 1)
        self.assertEqual(Transaction.objects.count(), 1)

    def test_delete_transaction(self):
        request = self.factory.delete(f"/transactions/{self.transaction.pk}")
        request.user = self.user
        self.view.setup(request)

        response = self.view.destroy(request, self.transaction.pk)

        self.assertEqual(response.status_code, 200, "Transaction deleted")
        self.assertEqual(self.user.transactions.count(), 0, "Transaction deleted")
