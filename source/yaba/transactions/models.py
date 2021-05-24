from django.db import models
from django.contrib.auth.models import User

from accounts.models import Account
from categories.models import SubCategory


class Transaction(models.Model):
    class Meta:
        ordering = ("-created",)

    note = models.TextField(blank=True, max_length=150)
    amount = models.IntegerField()
    created = models.DateTimeField(auto_now_add=True, editable=False)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="transactions", db_index=True, editable=False
    )
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name="transactions")
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="transactions")

    def __str__(self):
        return f"{self.owner.username} - {self.subcategory.name} - {self.amount}"
