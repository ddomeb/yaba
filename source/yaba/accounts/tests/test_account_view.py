from django.test import RequestFactory
from django.http.response import Http404
from rest_framework.test import APITestCase
from accounts.models import Account
from django.contrib.auth.models import User

from accounts.views import AccountView


class AccountViewUnitTests(APITestCase):
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
        self.test_account_id = dummy_account.id
        self.view = AccountView()

    def test_list_accounts(self):
        request = self.factory.get('/accounts')
        request.user = self.user
        self.view.setup(request)

        response = self.view.list(request)

        self.assertEqual(response.status_code, 200, 'Account listing HTTP 200')
        self.assertEqual(len(response.data), 1, 'Account listing response contains single account')
        self.assertEqual(
            response.data[0]["name"],
            "testaccount",
            'Test account is listed'
        )

    def test_add_valid_account(self):
        data = {"name": "new account", "description": "new description", "balance": 1000, "type": "account"}
        request = self.factory.post('/accounts/', data, content_type='application/json')
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 201, 'Account create HTTP 201')
        self.assertEqual(self.user.accounts.count(), 2, 'Account added')
        self.assertEqual(self.user.accounts.filter(name="new account").count(), 1, 'Account added with correct name')

    def test_add_account_with_no_name_fails(self):
        data = {"description": "new description", "balance": 1000, "type": "account"}
        request = self.factory.post('/accounts/', data, content_type='application/json')
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 400, 'Account create fail HTTP 400')
        self.assertEqual(self.user.accounts.count(), 1, 'Account created ')

    def test_add_account_with_no_desc_succeeds(self):
        data = {"name": "no desc", "balance": 1000, "type": "account"}
        request = self.factory.post('/accounts/', data, content_type='application/json')
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 201, 'Account create success HTTP 400')
        self.assertEqual(self.user.accounts.count(), 2)
        self.assertEqual(self.user.accounts.filter(name="no desc").count(), 1, 'Account added with correct name')

    def test_validation_errors_in_post_response(self):
        data = {"name": "", "balance": 1000, "type": "no such type"}
        request = self.factory.post('/accounts/', data, content_type='application/json')
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 400, 'Account create failed HTTP 400')
        self.assertCountEqual(list(response.data.keys()), ['name', 'type'])

    def test_retrieve_account(self):
        request = self.factory.get(f'/accounts/{self.test_account_id}')
        request.user = self.user
        self.view.setup(request)

        response = self.view.retrieve(request, self.test_account_id)

        self.assertEqual(response.status_code, 200, 'Account retrieved')
        self.assertEqual(response.data['name'], 'testaccount')

    def test_cannot_retrieve_other_users_account(self):
        new_user = User.objects.create_user('testuser2', 'testemail2', 'testpass')
        request = self.factory.get(f'/accounts/{self.test_account_id}')
        request.user = new_user
        self.view.setup(request)

        with self.assertRaises(Http404):
            response = self.view.retrieve(request, self.test_account_id)
            self.assertEqual(response.status_code, 404, 'Cannot retrieve other users account')

    def test_update_account(self):
        updated_acc = {"name": "updated", "description": "updated", "balance": -1000, "type": "savings"}
        request = self.factory.put(f'/accounts/{self.test_account_id}', updated_acc, content_type='application/json')
        request.user = self.user
        self.view.setup(request)

        response = self.view.update(request, self.test_account_id)

        self.assertEqual(response.status_code, 200, 'Account retrieved')
        self.assertEqual(response.data['name'], 'updated')

    def test_cannot_update_other_users_account(self):
        updated_acc = {"name": "updated", "description": "updated", "balance": -1000, "type": "savings"}
        request = self.factory.put(f'/accounts/{self.test_account_id}', updated_acc, content_type='application/json')
        request.user = User.objects.create_user('testuser2', 'testemail2', 'testpass')
        self.view.setup(request)

        with self.assertRaises(Http404):
            response = self.view.update(request, self.test_account_id)
            self.assertEqual(response.status_code, 404, 'Cannot update other users account')

    def test_delete_account(self):
        request = self.factory.delete(f'/accounts/{self.test_account_id}')
        request.user = self.user
        self.view.setup(request)

        response = self.view.destroy(request, self.test_account_id)

        self.assertEqual(response.status_code, 200, 'Account deleted')
        self.assertEqual(self.user.accounts.count(), 0, 'Account deleted')

    def test_cannot_delete_other_users_account(self):
        request = self.factory.delete(f'/accounts/{self.test_account_id}')
        request.user = User.objects.create_user('testuser2', 'testemail2', 'testpass')
        self.view.setup(request)

        with self.assertRaises(Http404):
            response = self.view.destroy(request, self.test_account_id)
            self.assertEqual(response.status_code, 404, 'Cannot delete other users account')
