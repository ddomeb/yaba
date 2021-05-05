from django.test import RequestFactory
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import Account
from django.contrib.auth.models import User

from accounts.views import AccountView


class AccountViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('testuser', 'testemail', 'testpass')
        self.factory = RequestFactory()
        dummy_account = Account(
            name='testaccount',
            description='testaccount',
            balance=1000,
            type='account',
            owner=self.user
        )
        dummy_account.save()

    def test_accounts_empty(self):
        request = self.factory.get('/accounts')
        request.user = self.user
        view = AccountView()
        view.setup(request)
        response = view.list(request)
        self.assertEqual(response.status_code, 200, 'Account listing HTTP 200')
        self.assertEqual(len(response.data), 1, 'Account listing response empty')
