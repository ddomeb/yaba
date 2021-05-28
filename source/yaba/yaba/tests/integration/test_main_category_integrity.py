from django.test import RequestFactory
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from accounts.views import AccountView
from categories.views import MainCategoryView
from transactions.views import TransactionView
from yaba.tests.utils import add_test_account, add_test_category, add_test_subcategory, add_test_transaction


class MainCategoryIntegrityTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("testuser", "testemail", "testpass")
        self.factory = RequestFactory()
        self.account = add_test_account(self.user, balance=0)
        self.main_category = add_test_category(self.user)
        self.subcategory = add_test_subcategory(self.user, main_category_pk=self.main_category.pk)
        add_test_transaction(self.user, subcategory_pk=self.subcategory.pk, amount=1000, account_pk=self.account.pk)
        add_test_transaction(self.user, subcategory_pk=self.subcategory.pk, amount=-100, account_pk=self.account.pk)

        self.tr_view = TransactionView()
        self.acc_view = AccountView()
        self.cat_view = MainCategoryView()

    def test_deleting_main_category_reverts_transactions(self):
        request = self.factory.delete(f"/categories/{self.main_category.pk}")
        request.user = self.user
        self.tr_view.setup(request)

        response = self.cat_view.destroy(request, self.main_category.pk)
        self.assertEqual(response.status_code, 200)

        request = self.factory.get(f"/accounts/{self.account.pk}")
        request.user = self.user
        self.acc_view.setup(request)

        response = self.acc_view.retrieve(request, self.account.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["balance"], -900)

        request = self.factory.get("/transactions/")
        request.user = self.user
        self.tr_view.setup(request)

        response = self.tr_view.list(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])
