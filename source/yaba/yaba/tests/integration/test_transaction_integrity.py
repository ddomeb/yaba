from django.test import RequestFactory
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from accounts.views import AccountView
from transactions.views import TransactionView
from yaba.tests.utils import add_test_account, add_test_category, add_test_subcategory


class TransactionIntegrityTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("testuser", "testemail", "testpass")
        self.factory = RequestFactory()
        self.account = add_test_account(self.user, balance=0)
        self.exp_main_category = add_test_category(self.user)
        self.exp_subcategory = add_test_subcategory(self.user, main_category_pk=self.exp_main_category.pk)
        self.inc_main_category = add_test_category(self.user, is_income=True)
        self.inc_subcategory = add_test_subcategory(self.user, main_category_pk=self.inc_main_category.pk)

        self.tr_view = TransactionView()
        self.acc_view = AccountView()

    def test_posting_income_gets_added(self):
        data = {"note": "new note", "amount": 1000, "subcategory": self.inc_subcategory.pk, "account": self.account.pk}
        request = self.factory.post("/transactions/", data, content_type="application/json")
        request.user = self.user
        self.tr_view.setup(request)

        response = self.tr_view.create(request)
        self.assertEqual(response.status_code, 201)

        request = self.factory.get(f"/accounts/{self.account.pk}")
        request.user = self.user
        self.acc_view.setup(request)

        response = self.acc_view.retrieve(request, self.account.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["balance"], 1000)

    def test_posting_expense_gets_subtracted(self):
        data = {"note": "new note", "amount": -1000, "subcategory": self.exp_subcategory.pk, "account": self.account.pk}
        request = self.factory.post("/transactions/", data, content_type="application/json")
        request.user = self.user
        self.tr_view.setup(request)

        response = self.tr_view.create(request)
        self.assertEqual(response.status_code, 201)

        request = self.factory.get(f"/accounts/{self.account.pk}")
        request.user = self.user
        self.acc_view.setup(request)

        response = self.acc_view.retrieve(request, self.account.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["balance"], -1000)

    def test_deleting_income_gets_subtracted(self):
        data = {"note": "new note", "amount": 1000, "subcategory": self.inc_subcategory.pk, "account": self.account.pk}
        request = self.factory.post("/transactions/", data, content_type="application/json")
        request.user = self.user
        self.tr_view.setup(request)

        response = self.tr_view.create(request)
        self.assertEqual(response.status_code, 201)
        transaction_id = response.data["id"]

        request = self.factory.get(f"/accounts/{self.account.pk}")
        request.user = self.user
        self.acc_view.setup(request)

        response = self.acc_view.retrieve(request, self.account.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["balance"], 1000)

        request = self.factory.delete(f"/transactions/{transaction_id}")
        request.user = self.user
        self.tr_view.setup(request)

        response = self.tr_view.destroy(request, transaction_id)

        self.assertEqual(response.status_code, 200, "Transaction deleted")

        request = self.factory.get(f"/accounts/{self.account.pk}")
        request.user = self.user

        response = self.acc_view.retrieve(request, self.account.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["balance"], 0)

    def test_deleting_expense_gets_added(self):
        data = {"note": "new note", "amount": -1000, "subcategory": self.exp_subcategory.pk, "account": self.account.pk}
        request = self.factory.post("/transactions/", data, content_type="application/json")
        request.user = self.user
        self.tr_view.setup(request)

        response = self.tr_view.create(request)
        self.assertEqual(response.status_code, 201)
        transaction_id = response.data["id"]

        request = self.factory.get(f"/accounts/{self.account.pk}")
        request.user = self.user
        self.acc_view.setup(request)

        response = self.acc_view.retrieve(request, self.account.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["balance"], -1000)

        request = self.factory.delete(f"/transactions/{transaction_id}")
        request.user = self.user
        self.tr_view.setup(request)

        response = self.tr_view.destroy(request, transaction_id)

        self.assertEqual(response.status_code, 200, "Transaction deleted")

        request = self.factory.get(f"/accounts/{self.account.pk}")
        request.user = self.user

        response = self.acc_view.retrieve(request, self.account.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["balance"], 0)
