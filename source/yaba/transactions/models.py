from django.db import models
from django.contrib.auth.models import User

from categories.models import SubCategory


class Transaction:
    note = models.TextField(blank=True)
    amount = models.IntegerField()
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='transactions',
        db_index=True,
        editable=False
    )
    subcategory = models.ForeignKey(
        SubCategory,
        on_delete=models.CASCADE,
        related_name="transactions"
    )
