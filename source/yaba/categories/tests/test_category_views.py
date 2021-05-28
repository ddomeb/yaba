from django.test import RequestFactory
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from categories.views import MainCategoryView, SubCategoryView
from yaba.tests.utils import add_test_category, add_test_subcategory


class MainCategoryViewUnitTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("testuser", "testemail", "testpass")
        self.factory = RequestFactory()
        self.view = MainCategoryView()
        self.income_category = add_test_category(owner=self.user, name="income", is_income=True, description="in")
        self.expense_category = add_test_category(owner=self.user, name="expense", is_income=False, description="out")

    def test_list_all_categories(self):
        request = self.factory.get("/categories")
        request.user = self.user
        self.view.setup(request)

        response = self.view.list(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertCountEqual([cat["id"] for cat in response.data], [self.income_category.pk, self.expense_category.pk])

    def test_list_queried_categories(self):
        for cat in self.income_category, self.expense_category:
            request = self.factory.get(f"/categories/?is_income={'true' if cat.isIncome else 'false'}")
            request.user = self.user
            self.view.setup(request)

            response = self.view.list(request)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data), 1)
            if cat.isIncome:
                self.assertCountEqual([cat["id"] for cat in response.data], [self.income_category.pk])
            else:
                self.assertCountEqual([cat["id"] for cat in response.data], [self.expense_category.pk])

    def test_add_new_category(self):
        data = {"name": "new main category", "description": "new description"}
        request = self.factory.post("/categories/", data, content_type="application/json")
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.user.main_categories.count(), 3)
        self.assertEqual(self.user.main_categories.filter(name="new main category").count(), 1)

    def test_add_category_validation_errors(self):
        data = {}
        request = self.factory.post("/categories/", data, content_type="application/json")
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.user.main_categories.count(), 2)
        self.assertCountEqual(response.data.keys(), ["name"])


class SubcategoryViewUnitTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("testuser", "testemail", "testpass")
        self.factory = RequestFactory()
        self.view = SubCategoryView()
        self.main_category = add_test_category(owner=self.user, name="income", is_income=True, description="in")
        self.subcategory = add_test_subcategory(
            owner=self.user, name="subcategory", main_category_pk=self.main_category.pk
        )

    def test_create_valid_subcategory(self):
        data = {"name": "new subcategory", "description": "new description", "main_category": self.main_category.pk}
        request = self.factory.post("/subcategories/", data, content_type="application/json")
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.user.subcategories.count(), 2)
        self.assertEqual(self.user.subcategories.filter(name="new subcategory").count(), 1)

    def test_add_category_validation_errors(self):
        data = {}
        request = self.factory.post("/subcategories/", data, content_type="application/json")
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.user.subcategories.count(), 1)
        self.assertCountEqual(response.data.keys(), ["name", "main_category"])

    def test_cannot_add_subcategory_to_other_users_category(self):
        new_user = User.objects.create_user("new_user")
        new_category = add_test_category(new_user)
        data = {"name": "test", "main_category": new_category.pk}
        request = self.factory.post("/subcategories/", data, content_type="application/json")
        request.user = self.user
        self.view.setup(request)

        response = self.view.create(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.user.subcategories.count(), 1)
        self.assertCountEqual(response.data.keys(), ["main_category"])
